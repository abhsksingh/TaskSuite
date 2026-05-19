const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin1234', 12);
  const memberPassword = await bcrypt.hash('Member1234', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      name: 'Member User',
      email: 'member@example.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  console.log('Seeded users:', { admin: admin.email, member: member.email });

  const project = await prisma.project.upsert({
    where: { title_ownerId: { title: 'My First Project', ownerId: admin.id } },
    update: {},
    create: {
      title: 'My First Project',
      description: 'A sample project for testing',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ownerId: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: { userId_projectId: { userId: admin.id, projectId: project.id } },
    update: {},
    create: { userId: admin.id, projectId: project.id, role: 'ADMIN' },
  });

  await prisma.projectMember.upsert({
    where: { userId_projectId: { userId: member.id, projectId: project.id } },
    update: {},
    create: { userId: member.id, projectId: project.id, role: 'MEMBER' },
  });

  const tasks = [
    { title: 'Design database schema', status: 'DONE', priority: 'HIGH', assigneeId: admin.id },
    { title: 'Implement auth', status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: admin.id },
    { title: 'Build frontend', status: 'TODO', priority: 'MEDIUM', assigneeId: member.id },
    { title: 'Write tests', status: 'TODO', priority: 'LOW', assigneeId: member.id, dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  ];

  for (const t of tasks) {
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assigneeId,
        projectId: project.id,
        dueDate: t.dueDate || null,
      },
    });
  }

  console.log('Seeded project and tasks');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
