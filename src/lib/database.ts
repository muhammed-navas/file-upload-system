import { User } from '@/types';
import { Types } from 'mongoose';
import { connectToDatabase } from './mongodb';
import { UserModel, UserDoc } from './models/User';

export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    await connectToDatabase();
    const doc = await UserModel.findOne({ email }).lean<UserDoc & { _id: Types.ObjectId }>();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      createdAt: doc.createdAt,
      password: doc.password,
    };
  } catch (error) {
    console.error('Error in findUserByEmail:', error);
    throw error;
  }
};

export const findUserById = async (id: string): Promise<User | null> => {
  try {
    await connectToDatabase();
    const doc = await UserModel.findById(id).lean<UserDoc & { _id: Types.ObjectId }>();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      createdAt: doc.createdAt,
      password: doc.password,
    };
  } catch (error) {
    console.error('Error in findUserById:', error);
    throw error;
  }
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<User> => {
  try {
    await connectToDatabase();
    const now = new Date().toISOString();
    const userDoc = await UserModel.create({ ...userData, createdAt: now });
    return {
      id: (userDoc as any)._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      createdAt: userDoc.createdAt,
      password: userDoc.password,
    };
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
};