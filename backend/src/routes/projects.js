const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate, projectAdminOnly, projectMemberOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createProjectSchema, updateProjectSchema, addMemberSchema } = require('../validators/project');
const { createTaskSchema } = require('../validators/task');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') {
      const projects = await prisma.project.findMany({
        include: {
          _count: { select: { tasks: true, members: true } },
          owner: { select: { id: true, name: true, email: true } },
        },
      });
      return res.json({ projects });
    }

    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      include: {
        project: {
          include: {
            _count: { select: { tasks: true, members: true } },
            owner: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    const projects = memberships.map((m) => m.project);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(createProjectSchema), async (req, res, next) => {
  try {
    const { title, description, deadline } = req.validated.body;

    const existing = await prisma.project.findFirst({
      where: { title, ownerId: req.user.id },
    });
    if (existing) {
      return res.status(400).json({ error: true, message: 'You already have a project with this title', field: 'title' });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        ownerId: req.user.id,
      },
    });

    await prisma.projectMember.create({
      data: {
        userId: req.user.id,
        projectId: project.id,
        role: 'ADMIN',
      },
    });

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', projectMemberOnly, async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: {
          include: { assignee: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });
    if (!project) {
      return res.status(404).json({ error: true, message: 'Project not found' });
    }
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/tasks', projectMemberOnly, async (req, res, next) => {
  try {
    const { priority, status } = req.query;
    const where = { projectId: req.params.id };
    if (priority) where.priority = priority;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: { assignee: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/tasks', projectMemberOnly, validate(createTaskSchema), async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, assigneeId } = req.validated.body;

    if (assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId: req.params.id } },
      });
      if (!isMember) {
        return res.status(400).json({ error: true, message: 'Assignee must be a project member', field: 'assigneeId' });
      }
    }

    if (dueDate) {
      const d = new Date(dueDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (d < now) {
        return res.status(400).json({ error: true, message: 'Due date must not be in the past', field: 'dueDate' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        projectId: req.params.id,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', projectAdminOnly, validate(updateProjectSchema), async (req, res, next) => {
  try {
    const data = {};
    const { title, description, deadline, status } = req.validated.body;
    if (title) data.title = title;
    if (description !== undefined) data.description = description;
    if (deadline) data.deadline = new Date(deadline);
    if (status) data.status = status;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', projectAdminOnly, async (req, res, next) => {
  try {
    const openTasks = await prisma.task.count({
      where: { projectId: req.params.id, status: { not: 'DONE' } },
    });
    if (openTasks > 0) {
      return res.status(400).json({
        error: true,
        message: `Cannot delete project with ${openTasks} open task(s). Complete or delete them first.`,
      });
    }
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/members', projectAdminOnly, validate(addMemberSchema), async (req, res, next) => {
  try {
    const { email, role } = req.validated.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found', field: 'email' });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: req.params.id } },
    });
    if (existing) {
      return res.status(400).json({ error: true, message: 'User is already a member of this project' });
    }

    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId: req.params.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/members/:userId', projectAdminOnly, async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ error: true, message: 'Cannot remove yourself from the project' });
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: req.params.id } },
    });
    if (!membership) {
      return res.status(404).json({ error: true, message: 'Member not found' });
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId: req.params.id } },
    });
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
