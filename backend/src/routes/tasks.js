const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate, canManageTask, canUpdateStatus } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateTaskSchema, updateTaskStatusSchema } = require('../validators/task');

const router = express.Router();

router.use(authenticate);

const STATUS_ORDER = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };

router.patch('/:id', canManageTask, validate(updateTaskSchema), async (req, res, next) => {
  try {
    const data = {};
    const { title, description, priority, dueDate, assigneeId } = req.validated.body;
    if (title) data.title = title;
    if (description !== undefined) data.description = description;
    if (priority) data.priority = priority;
    if (dueDate) data.dueDate = new Date(dueDate);
    if (assigneeId) {
      const task = await prisma.task.findUnique({ where: { id: req.params.id } });
      if (task) {
        const isMember = await prisma.projectMember.findUnique({
          where: { userId_projectId: { userId: assigneeId, projectId: task.projectId } },
        });
        if (!isMember) {
          return res.status(400).json({ error: true, message: 'Assignee must be a project member', field: 'assigneeId' });
        }
      }
      data.assigneeId = assigneeId;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', canUpdateStatus, validate(updateTaskStatusSchema), async (req, res, next) => {
  try {
    const { status } = req.validated.body;
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) {
      return res.status(404).json({ error: true, message: 'Task not found' });
    }

    if (STATUS_ORDER[status] < STATUS_ORDER[task.status]) {
      return res.status(400).json({
        error: true,
        message: `Status cannot move backward from ${task.status} to ${status}`,
      });
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { status },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', canManageTask, async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: true, message: 'Task not found' });
    }
    next(err);
  }
});

module.exports = router;
