import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface UserInput {
  email: string;
  password: string;
  name?: string;
}

interface UserProfileUpdate {
  email?: string;
  name?: string;
}

const UserModel = {
  async create({ email, password, name }: UserInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return user;
  },

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  async updateProfile(id: number, { name, email }: UserProfileUpdate): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email },
    });

    return updatedUser;
  },

  async updatePassword(id: number, password: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return true;
  },
};

export default UserModel;
