const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/summary', async (req, res, next) => {
  try {
    let projectFilter = {};
    if (req.user.role !== 'ADMIN') {
      const memberships = await prisma.projectMember.findMany({
        where: { userId: req.user.id },
        select: { projectId: true },
      });
      const projectIds = memberships.map((m) => m.projectId);
      projectFilter = { projectId: { in: projectIds } };
    }

    const totalTasks = await prisma.task.count({ where: projectFilter });

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const completedThisWeek = await prisma.task.count({
      where: {
        ...projectFilter,
        status: 'DONE',
        updatedAt: { gte: startOfWeek },
      },
    });

    const overdue = await prisma.task.count({
      where: {
        ...projectFilter,
        status: { not: 'DONE' },
        dueDate: { lt: now },
      },
    });

    let activeProjects;
    if (req.user.role === 'ADMIN') {
      activeProjects = await prisma.project.count({ where: { status: 'ACTIVE' } });
    } else {
      const memberships = await prisma.projectMember.findMany({
        where: { userId: req.user.id },
        include: { project: { select: { status: true } } },
      });
      activeProjects = memberships.filter((m) => m.project.status === 'ACTIVE').length;
    }

    res.json({
      summary: { totalTasks, completedThisWeek, overdue, activeProjects },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/overdue', async (req, res, next) => {
  try {
    const now = new Date();
    let where = {
      status: { not: 'DONE' },
      dueDate: { lt: now },
    };

    if (req.user.role !== 'ADMIN') {
      const memberships = await prisma.projectMember.findMany({
        where: { userId: req.user.id },
        select: { projectId: true },
      });
      where.projectId = { in: memberships.map((m) => m.projectId) };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const overdueTasks = tasks.map((task) => ({
      ...task,
      daysOverdue: Math.floor((now - new Date(task.dueDate)) / (1000 * 60 * 60 * 24)),
    }));

    res.json({ tasks: overdueTasks });
  } catch (err) {
    next(err);
  }
});

router.get('/my-tasks', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: req.user.id },
      include: {
        project: { select: { id: true, title: true } },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
