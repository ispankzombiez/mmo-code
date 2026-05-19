import { prisma } from '../client.js';

async function main() {
  const secretContent = 'demo-secret';

  const user = await prisma.user.upsert({
    where: { email: 'demo@mmo.local' },
    update: {},
    create: {
      email: 'demo@mmo.local',
      username: 'demo',
      passwordHash: 'dev-only-placeholder',
    },
  });

  const vm = await prisma.virtualComputer.upsert({
    where: { dynamicIp: '10.10.0.2' },
    update: {},
    create: {
      ownerId: user.id,
      hostname: 'demo-node',
      dynamicIp: '10.10.0.2',
      cpuCores: 4,
      memoryMb: 4096,
      storageMb: 51200,
      openPorts: [22, 80, 443],
    },
  });

  await prisma.virtualFileSystem.createMany({
    data: [
      {
        computerId: vm.id,
        ownerId: user.id,
        name: 'home',
        path: '/home',
        nodeType: 'DIRECTORY',
      },
      {
        computerId: vm.id,
        ownerId: user.id,
        name: 'secrets.txt',
        path: '/home/secrets.txt',
        nodeType: 'FILE',
        content: secretContent,
        sizeBytes: Buffer.byteLength(secretContent, 'utf8'),
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
