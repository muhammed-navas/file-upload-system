'use client';

import React, { useState, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '../ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';


export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();


  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = Array.from(e.target.files).filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 10MB)`);
          return false;
        }
        return true;
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0 || !user) return;

    setUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      await apiClient.post('/files/upload', formData);

      setSelectedFiles([]);
      toast.success('Files uploaded successfully');
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };



  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to upload files</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed transition-colors cursor-pointer `}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              Drag & drop files here, or{' '}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="*/*"
                />
              </label>
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum file size: 10MB per file
            </p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div>
          <div className="p-4">
            <h3 className="font-medium mb-3">Selected Files ({selectedFiles.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button label='X' onClick={() => removeFile(index)} />
                </div>
              ))}
            </div>
            <Button 
              disabled={uploading} 
              label={uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`} 
              onClick={uploadFiles} 
            />
          </div>
        </div>
      )}
    </div>
  );
}