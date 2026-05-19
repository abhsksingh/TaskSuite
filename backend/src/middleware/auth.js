const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: true, message: 'Token expired' });
    }
    return res.status(401).json({ error: true, message: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
  } catch (err) {
    // ignore
  }
  next();
}

function globalAdminOnly(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: true, message: 'Global admin access required' });
  }
  next();
}

async function projectAdminOnly(req, res, next) {
  try {
    const projectId = req.params.id;
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId } },
    });
    if (req.user.role === 'ADMIN') return next();
    if (membership && membership.role === 'ADMIN') return next();
    return res.status(403).json({ error: true, message: 'Project admin access required' });
  } catch (err) {
    next(err);
  }
}

async function projectMemberOnly(req, res, next) {
  try {
    const projectId = req.params.id || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ error: true, message: 'Project ID required' });
    }
    if (req.user.role === 'ADMIN') return next();
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId } },
    });
    if (!membership) {
      return res.status(403).json({ error: true, message: 'Not a project member' });
    }
    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
}

async function canManageTask(req, res, next) {
  try {
    const taskId = req.params.id;
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: true, message: 'Task not found' });
    }
    if (req.user.role === 'ADMIN') return next();
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId: task.projectId } },
    });
    if (membership && (membership.role === 'ADMIN' || task.assigneeId === req.user.id)) {
      return next();
    }
    return res.status(403).json({ error: true, message: 'Not authorized to manage this task' });
  } catch (err) {
    next(err);
  }
}

async function canUpdateStatus(req, res, next) {
  try {
    const taskId = req.params.id;
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: true, message: 'Task not found' });
    }
    if (req.user.role === 'ADMIN') return next();
    if (task.assigneeId === req.user.id) return next();
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId: task.projectId } },
    });
    if (membership && membership.role === 'ADMIN') return next();
    return res.status(403).json({ error: true, message: 'Not authorized to update task status' });
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate, optionalAuth, globalAdminOnly, projectAdminOnly, projectMemberOnly, canManageTask, canUpdateStatus };
