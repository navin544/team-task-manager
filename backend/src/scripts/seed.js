const bcrypt = require('bcryptjs');

const { connectToDatabase, disconnectFromDatabase } = require('../config/database');
const {
  ActivityLog,
  Notification,
  PasswordResetToken,
  Project,
  RefreshToken,
  Task,
  User
} = require('../models');

async function main() {
  await connectToDatabase();

  await Promise.all([
    ActivityLog.deleteMany({}),
    Notification.deleteMany({}),
    PasswordResetToken.deleteMany({}),
    RefreshToken.deleteMany({}),
    Task.deleteMany({}),
    Project.deleteMany({}),
    User.deleteMany({})
  ]);

  const adminPassword = await bcrypt.hash('Admin@12345', 12);
  const memberPassword = await bcrypt.hash('Member@12345', 12);

  const [admin, member] = await User.create([
    {
      name: 'System Admin',
      email: 'admin@teamtaskmanager.dev',
      password: adminPassword,
      role: 'ADMIN',
      avatar:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Delivery Member',
      email: 'member@teamtaskmanager.dev',
      password: memberPassword,
      role: 'MEMBER',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
    }
  ]);

  const project = await Project.create({
    title: 'Q3 Product Launch',
    description: 'Coordinate design, engineering, QA, and marketing for the new feature launch.',
    createdById: admin.id,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
    status: 'ACTIVE',
    progress: 40,
    members: [
      { userId: admin.id, role: 'ADMIN' },
      { userId: member.id, role: 'MEMBER' }
    ]
  });

  await Task.create([
    {
      title: 'Prepare launch checklist',
      description: 'Define release, rollback, QA and comms checklist.',
      projectId: project.id,
      assignedToId: member.id,
      createdById: admin.id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5)
    },
    {
      title: 'Review production analytics dashboard',
      description: 'Validate launch KPI tracking and anomaly alerts.',
      projectId: project.id,
      assignedToId: admin.id,
      createdById: admin.id,
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8)
    }
  ]);
}

main()
  .then(async () => {
    await disconnectFromDatabase();
  })
  .catch(async (error) => {
    console.error(error);
    await disconnectFromDatabase();
    process.exit(1);
  });
