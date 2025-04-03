import { PrismaClient, Status } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const Conversion = {
  async create({
    userId,
    originalFileName,
    filePath,
  }: {
    userId: number;
    originalFileName: string;
    filePath: string;
  }) {
    return await prisma.conversion.create({
      data: {
        id: uuidv4(),
        userId,
        originalFileName,
        filePath,
        status: 'pending', // ✅ Use lowercase string instead of Status.PENDING
      },
    });
  },

  async findById(id: string) {
    return await prisma.conversion.findUnique({
      where: { id },
    });
  },

  async findByUser(userId: number) {
    return await prisma.conversion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateStatus(id: string, status: Status) {
    return await prisma.conversion.update({
      where: { id },
      data: {
        status, // ✅ `status` is already of type Status, no need to use Status.PENDING
        updatedAt: new Date(),
      },
    });
  },

  async updateXmlContent(id: string, xmlContent: string) {
    return await prisma.conversion.update({
      where: { id },
      data: {
        xmlContent,
        status: 'completed', // ✅ Use lowercase string instead of Status.COMPLETED
        updatedAt: new Date(),
      },
    });
  },
};

export default Conversion;
