'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '../ui/Button';
import { useAuth } from '@/context/AuthContext';
import { FileItem } from '@/types';
import { toast } from 'react-toastify';
import { formatFileSize } from './FileUpload';
import { onFilesUploaded } from '@/lib/events';

export default function FileList() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<
    'all' | 'images' | 'videos' | 'audio' | 'documents' | 'archives' | 'others'
  >('all');

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onFilesUploaded((newFiles: any[]) => {
      setFiles(prev => {
        // Deduplicate by id and merge, then sort by createdAt desc
        const map = new Map<string, FileItem>();
        prev.forEach(f => map.set(f.id, f));
        newFiles.forEach((nf: any) => {
          const normalized: FileItem = {
            id: nf.id,
            filename: nf.filename,
            originalName: nf.originalName,
            mimetype: nf.mimetype,
            size: nf.size,
            cloudinaryUrl: nf.cloudinaryUrl,
            uploadedBy: nf.uploadedBy,
            createdAt: nf.createdAt,
          };
          map.set(normalized.id, normalized);
        });
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return merged;
      });
    });

    return unsubscribe;
  }, []);

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

  const downloadFile = async (file: FileItem) => {
    try {
      const response = await apiClient.get(`/files/${file.id}`, { responseType: 'blob' as any });
      const blob = new Blob([response.data], { type: file.mimetype || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error('Error downloading file:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to download file';
      toast.error(errorMessage);
    }
  };

  const categorize = (file: FileItem): 'images' | 'videos' | 'audio' | 'documents' | 'archives' | 'others' => {
    const type = file.mimetype || '';
    if (type.startsWith('image/')) return 'images';
    if (type.startsWith('video/')) return 'videos';
    if (type.startsWith('audio/')) return 'audio';
    if (
      type === 'application/pdf' ||
      type === 'application/msword' ||
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'text/plain'
    ) return 'documents';
    if (type === 'application/zip' || type === 'application/vnd.rar') return 'archives';
    return 'others';
  };

  const filteredFiles = files.filter(file => {
    if (filterType === 'all') return true;
    return categorize(file) === filterType;
  });


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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl font-semibold">Your Files ({filteredFiles.length}/{files.length})</h2>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            <option value="images">Images</option>
            <option value="videos">Videos</option>
            <option value="documents">Documents</option>

          </select>
          <Button label="Refresh" onClick={fetchFiles} />
        </div>
      </div>
      
      <div className="grid gap-4">
        {filteredFiles.map((file) => (
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
                      {formatFileSize(file.size)} 
                    </p>
                    <p className="text-xs text-gray-400">
                      Uploaded {new Date(file.createdAt).toLocaleString()}
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
                  label="Download"
                  onClick={() => downloadFile(file)}
                />
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