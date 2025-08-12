import { NextRequest, NextResponse } from 'next/server';
import { FileModel } from '@/lib/models/File';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    const user = await verifyToken(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = context.params || {};

    const file = await FileModel.findById(id);
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Check if user owns the file
    if (file.uploadedBy.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this file' },
        { status: 403 }
      );
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(file.cloudinaryPublicId);

    // Delete from database
    await FileModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting file:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete file';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  }
} 