import { Schema, model, models, Model } from 'mongoose';

export interface UserDoc {
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

const UserSchema = new Schema<UserDoc>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export const UserModel: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>('User', UserSchema); 