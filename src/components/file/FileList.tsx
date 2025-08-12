'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '../ui/Button';
import { useAuth } from '@/context/AuthContext';
import { FileItem } from '@/types';
import { toast } from 'react-toastify';

export default function FileList() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/files');

      if (response.data.success) {
        setFiles(response.data.files);
      } else {
        throw new Error(response.data.error || 'Failed to fetch files');
      }
    } catch (err: unknown) {
      console.error('Error fetching files:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch files';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await apiClient.delete(`/files/${fileId}`);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      toast.success('File deleted');
    } catch (err: unknown) {
      console.error('Error deleting file:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file';
      toast.error(errorMessage);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to view your files</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Files ({files.length})</h2>
        <Button label="Refresh" onClick={fetchFiles} />
      </div>
      
      <div className="grid gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary text-sm font-medium">
                        {file.originalName.split('.').pop()?.toUpperCase() || 'FILE'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={file.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  View
                </a>
                <Button
                  label="Delete"
                  onClick={() => deleteFile(file.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 