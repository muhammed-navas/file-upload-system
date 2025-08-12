import { NextRequest, NextResponse } from 'next/server';
import { FileModel } from '@/lib/models/File';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const files = await FileModel.find()
      .sort({ createdAt: -1 })
      .lean();

    const formattedFiles = files.map(file => ({
      id: file._id.toString(),
      filename: file.filename,
      originalName: file.originalName,
      mimetype: file.mimetype,
      size: file.size,
      cloudinaryUrl: file.cloudinaryUrl,
      uploadedBy: file.uploadedBy.toString(),
      createdAt: file.createdAt,
    }));

    return NextResponse.json({
      success: true,
      files: formattedFiles,
    });
  } catch (error: unknown) {
    console.error('Error fetching files:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch files';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  }
} 