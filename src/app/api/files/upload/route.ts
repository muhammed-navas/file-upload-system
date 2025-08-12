import { NextRequest, NextResponse } from 'next/server';
import { FileModel } from '@/lib/models/File';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import cloudinary, { assertCloudinaryConfigured } from '@/lib/cloudinary';


export const runtime = 'nodejs';

function sanitizeFilename(filename: string): string {
  return filename.replace(/[\s]+/g, '_').replace(/[^\w.-]/g, '_');
}

function detectMimeType(file: File): string {
  return file.type 
}

async function uploadBufferToCloudinary(buffer: Buffer, originalFilename: string, mimetype: string) {
  const base64 = buffer.toString('base64');
  const dataUri = `data:${mimetype};base64,${base64}`;
  const sanitized = sanitizeFilename(originalFilename).replace(/\.[^.]+$/, '');

  return cloudinary.uploader.upload(dataUri, {
    folder: 'file-system',
    resource_type: 'auto',
    use_filename: true,
    unique_filename: false,
    overwrite: false,
    public_id: sanitized,
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure Cloudinary is configured, and DB connected
    assertCloudinaryConfigured();
    await connectToDatabase();

    // Parse incoming form data
    const formData = await req.formData();
    let files = formData.getAll('files') as File[];

    // Normalize: if it's a single file, make it an array
    if (files.length === 1 && !(files[0] instanceof File)) {
      return NextResponse.json({ success: false, error: 'Invalid file format' }, { status: 400 });
    }
    files = files.filter(f => f instanceof File); // remove invalid entries

    if (!files.length) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
    }

    // Upload each file safely
    const results = await Promise.allSettled(
      files.map(async (file) => {
        if (!file.name) throw new Error('File name is missing.');
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const mimetype = detectMimeType(file);
        const uploadResult = await uploadBufferToCloudinary(buffer, file.name, mimetype);

        const fileDoc = await FileModel.create({
          filename: uploadResult.public_id,
          originalName: file.name,
          mimetype,
          size: buffer.length,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          uploadedBy: user.id,
          createdAt: new Date().toISOString(),
        });

        return {
          id: (fileDoc as any)._id.toString(),
          filename: fileDoc.filename,
          originalName: fileDoc.originalName,
          mimetype: fileDoc.mimetype,
          size: fileDoc.size,
          cloudinaryUrl: fileDoc.cloudinaryUrl,
          uploadedBy: (fileDoc.uploadedBy as any).toString(),
          createdAt: fileDoc.createdAt,
        };
      })
    );

    // Separate successes and errors
    const uploadedFiles = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    const errors = results
      .map((r, i) => {
        if (r.status === 'fulfilled') return null;
        const reason = r.reason instanceof Error
          ? r.reason.message
          : typeof r.reason === 'string'
            ? r.reason
            : JSON.stringify(r.reason);
        return { index: i, error: reason };
      })
      .filter(Boolean) as { index: number; error: string }[];

    if (!uploadedFiles.length) {
      return NextResponse.json({ success: false, error: 'All uploads failed', errors }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: errors.length ? 'Some files uploaded successfully' : 'All files uploaded successfully',
      files: uploadedFiles,
      errors: errors.length ? errors : undefined,
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'File upload failed' },
      { status: 500 }
    );
  }
}
