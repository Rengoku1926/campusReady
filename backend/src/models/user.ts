import { PrismaClient } from "@prisma/client";
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


export type UserType = {
  id: number;
  email: string;
  name?: string | null;
  password: string;
};

const UserModel = {
  async create({ email, password, name }: UserInput): Promise<UserType> {
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

  async findByEmail(email: string): Promise<UserType | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: number): Promise<UserType | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  async updateProfile(id: number, { name, email }: UserProfileUpdate): Promise<UserType> {
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
