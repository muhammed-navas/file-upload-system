export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    password?: string; // Add password for internal use
  }
  
  export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
  }
  
  export interface FileItem {
    id: string;
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    cloudinaryUrl: string;
    uploadedBy: string;
    createdAt: string;
  }

  export interface File {
    id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    cloudinaryUrl: string;
    cloudinaryPublicId: string;
    uploadedBy: string;
    createdAt: string;
  }