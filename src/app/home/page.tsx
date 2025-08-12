'use client';

import React from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import FileUpload from '@/components/file/FileUpload';
import FileList from '@/components/file/FileList';

export default function DashboardPage() {


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">File Storage Dashboard</h1>
              <p className="text-muted-foreground">
                Upload, manage, and organize your files securely in the cloud.
              </p>
            </div>
            <FileUpload />
            <div className="border-t pt-8">
              <FileList />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}