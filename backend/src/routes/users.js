const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate, globalAdminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', globalAdminOnly, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
