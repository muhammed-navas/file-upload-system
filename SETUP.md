# File Upload System Setup Guide

This guide will help you set up the file upload system with Cloudinary and Multer.

## Prerequisites

- Node.js and npm installed
- MongoDB database
- Cloudinary account

## Installation

1. Install the required dependencies:
```bash
npm install multer cloudinary multer-storage-cloudinary @types/multer
```

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
REFRESH_SECRET=your-super-secret-refresh-key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/file-system

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com/) and create an account
2. Get your Cloud Name, API Key, and API Secret from your dashboard
3. Add these values to your `.env.local` file

## Features

- **Multiple File Upload**: Upload up to 10 files at once
- **File Size Limit**: Maximum 10MB per file
- **Supported Formats**: Images, documents, videos, audio files
- **Cloud Storage**: Files are stored securely in Cloudinary
- **Database Tracking**: File metadata is stored in MongoDB
- **User Authentication**: Files are associated with authenticated users
- **File Management**: View, download, and delete uploaded files

## API Endpoints

- `POST /api/files/upload` - Upload files
- `GET /api/files` - Get user's files
- `DELETE /api/files/[id]` - Delete a specific file

## File Model

The system stores the following file information:
- Filename and original name
- File size and MIME type
- Cloudinary URL and public ID
- Upload timestamp
- User who uploaded the file

## Security Features

- JWT authentication required for all file operations
- Users can only access their own files
- File deletion removes files from both Cloudinary and database
- File size and count limits prevent abuse

## Usage

1. Users must be logged in to upload files
2. Drag and drop files or click to browse
3. Files are automatically uploaded to Cloudinary
4. File information is stored in the database
5. Users can view, download, and delete their files

## Troubleshooting

- Ensure all environment variables are set correctly
- Check that Cloudinary credentials are valid
- Verify MongoDB connection
- Check file size and format restrictions 