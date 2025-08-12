import { NextRequest, NextResponse } from 'next/server';
import { FileModel } from '@/lib/models/File';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET(
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

    const file = await FileModel.findById(id).lean();

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Only allow the owner to download
    if (file.uploadedBy.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to download this file' },
        { status: 403 }
      );
    }

    // Stream/proxy the file from Cloudinary with a download disposition
    const cloudUrl: string = (file as any).cloudinaryUrl;
    const originalName: string = (file as any).originalName || 'download';
    const mimetype: string = (file as any).mimetype || 'application/octet-stream';

    const upstream = await fetch(cloudUrl);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { success: false, error: 'Unable to fetch file from storage' },
        { status: 502 }
      );
    }

    const headers = new Headers();
    headers.set('Content-Type', mimetype);
    headers.set('Content-Disposition', `attachment; filename="${originalName}"`);
    headers.set('Cache-Control', 'private, max-age=0, must-revalidate');

    return new NextResponse(upstream.body as any, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    console.error('Error downloading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to download file';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  }
}

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