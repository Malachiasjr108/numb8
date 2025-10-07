
// Database storage for Echo images
import { prisma } from "./db";

export async function saveEchoImage(
  echoNumber: number,
  cloudStoragePath: string
): Promise<void> {
  await prisma.echoImage.upsert({
    where: { echoNumber },
    update: {
      cloudStoragePath,
      updatedAt: new Date(),
    },
    create: {
      echoNumber,
      cloudStoragePath,
    },
  });
}

export async function getEchoImage(echoNumber: number) {
  return await prisma.echoImage.findUnique({
    where: { echoNumber },
  });
}

export async function getAllEchoImages() {
  return await prisma.echoImage.findMany({
    orderBy: { echoNumber: "asc" },
  });
}

export async function deleteEchoImage(echoNumber: number): Promise<void> {
  await prisma.echoImage.delete({
    where: { echoNumber },
  });
}
