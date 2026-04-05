import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Create admin user
  await prisma.user.upsert({
    where: { orgId_email: { orgId: 'default-org', email: 'admin@mrrm.local' } },
    update: {},
    create: {
      id: 'admin',
      email: 'admin@mrrm.local',
      name: 'System Admin',
      passwordHash,
      phone: '13800138000',
      orgId: 'default-org',
      status: 'ACTIVE',
      failedLoginAttempts: 0,
    },
  });

  console.log('Admin user seeded: admin@mrrm.local / admin123');

  // Assign admin role to admin user
  const adminRole = await prisma.role.findFirst({ where: { code: 'ADMIN' } });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: 'admin', roleId: adminRole.id } },
      update: {},
      create: { userId: 'admin', roleId: adminRole.id },
    });
    console.log('Admin role assigned');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});