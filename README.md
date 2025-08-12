## File System (Next.js + MongoDB + Cloudinary)

A simple, full-stack file storage app built with Next.js App Router. Users can register and log in, upload multiple files to Cloudinary, list files, and download or delete files they own. JWT access tokens are used for API authorization, with a secure httpOnly refresh token cookie for session continuity.

### Features
- **Authentication**: Register, login, logout, access/refresh tokens
- **File uploads**: Multiple file uploads to Cloudinary (10MB/file, up to 10 files)
- **File management**: List all uploaded files, download own files, delete own files
- **Protected UI**: Client-side protection and auto token refresh
- **Tech**: Next.js 15, React 19, TypeScript, MongoDB (Mongoose), Cloudinary, Axios

### Getting Started

#### Prerequisites
- **Node.js**: v18.18+ (or v20+) recommended
- **MongoDB**: A connection string (Atlas or local)
- **Cloudinary**: Account with API credentials

#### 1) Clone and install
```bash
git clone <your-repo-url> file-system
cd file-system
npm install
```

#### 2) Configure environment variables
Create a `.env.local` file in the project root and add:
```bash
MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority

# JWT secrets (use strong random values in production)
JWT_SECRET=replace-with-a-strong-random-string
REFRESH_SECRET=replace-with-a-strong-random-string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 3) Run the app
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Scripts
- `npm run dev`: Start dev server
- `npm run build`: Build for production
- `npm run start`: Run production server
- `npm run lint`: Lint the codebase

### Project Structure
```
file-system/
  src/
    app/
      api/               # API routes (App Router)
        auth/
          login/route.ts      # POST /api/auth/login
          logout/route.ts     # POST /api/auth/logout
          refresh/route.ts    # POST /api/auth/refresh
          register/route.ts   # POST /api/auth/register
        files/
          route.ts            # GET /api/files
          [id]/route.ts       # GET/DELETE /api/files/:id
          upload/route.ts     # POST /api/files/upload (multipart/form-data)
    components/
      file/              # FileList, FileUpload
    context/
      AuthContext.tsx    # Client auth state, token refresh
    lib/
      api.ts             # Axios client with auth interceptors
      auth.ts            # JWT helpers
      mongodb.ts         # Mongoose connection
      cloudinary.ts      # Cloudinary config
      models/            # Mongoose models (User, File)
      events.ts          # Simple event bus (files uploaded)
```

### Authentication Overview
- **Access Token**: Sent via `Authorization: Bearer <token>` header; short-lived (~15m).
- **Refresh Token**: Stored as httpOnly cookie; server uses it to issue new access tokens.
- The client (`src/lib/api.ts`) automatically attempts `/api/auth/refresh` on 401 responses and retries the original request.

### File Uploads
- Endpoint: `POST /api/files/upload`
- Requires auth (`Authorization: Bearer <accessToken>`)
- Multipart form field: `files` (one or multiple)
- Limits: 10 files, 10MB per file

### API Reference
A concise list is below. For full request/response bodies, status codes, and examples, see [`API.md`](./API.md).

| Method | Path                  | Auth | Description |
|-------:|-----------------------|:----:|-------------|
| POST   | `/api/auth/register`  |  No  | Create a new user and set refresh cookie |
| POST   | `/api/auth/login`     |  No  | Log in and set refresh cookie |
| POST   | `/api/auth/logout`    | Yes* | Clear refresh cookie (*requires active cookie) |
| POST   | `/api/auth/refresh`   | Yes* | Issue new access token using refresh cookie |
| GET    | `/api/files`          | Yes  | List uploaded files (sorted by newest) |
| POST   | `/api/files/upload`   | Yes  | Upload files (multipart/form-data) |
| GET    | `/api/files/:id`      | Yes  | Download a file (owner only) |
| DELETE | `/api/files/:id`      | Yes  | Delete a file (owner only) |

### Troubleshooting
- "MongoDB connection failed": Verify `MONGODB_URL` and database availability.
- "Missing Cloudinary environment variables": Ensure Cloudinary keys are set in `.env.local`.
- 401 Unauthorized on protected routes: Confirm `Authorization: Bearer <accessToken>` header and that the access token is fresh; rely on client auto-refresh if using the built-in UI.

### License
MIT or your preferred license.
