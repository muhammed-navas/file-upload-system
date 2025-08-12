import { Schema, model, models, Model, Types } from 'mongoose';

export interface FileDoc {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  uploadedBy: Types.ObjectId;
  createdAt: string;
}

const FileSchema = new Schema<FileDoc>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  cloudinaryUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: String, required: true },
});

export const FileModel: Model<FileDoc> =
  (models.File as Model<FileDoc>) || model<FileDoc>('File', FileSchema); 