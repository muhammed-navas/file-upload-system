## API Documentation

Base URL: `/api`

### Auth

#### POST /auth/register
Create a new user and set a refresh token cookie.

Request
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Responses
- 201/200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "<string>",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "accessToken": "<jwt>"
  }
}
```
- 400 Bad Request
```json
{ "success": false, "error": "All fields are required" }
```
- 409 Conflict
```json
{ "success": false, "error": "User already exists" }
```

Notes
- Sets `refreshToken` as httpOnly cookie (7 days).

---

#### POST /auth/login
Authenticate a user and set a refresh token cookie.

Request
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Responses
- 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "<string>",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "accessToken": "<jwt>"
  }
}
```
- 401 Unauthorized
```json
{ "success": false, "error": "Invalid credentials" }
```

Notes
- Sets `refreshToken` as httpOnly cookie (7 days).

---

#### POST /auth/refresh
Issue a new access token using the refresh token cookie.

Request
- No body. Requires `refreshToken` cookie.

Responses
- 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "user": {
      "id": "<string>",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```
- 401 Unauthorized
```json
{ "success": false, "error": "No refresh token provided" }
```

Notes
- Also rotates the `refreshToken` cookie.

---

#### POST /auth/logout
Clear the refresh token cookie.

Request
- No body. Requires active `refreshToken` cookie.

Responses
- 200 OK
```json
{ "success": true }
```

---

### Files
All file routes require an access token header: `Authorization: Bearer <accessToken>`.

#### GET /files
List files (newest first).

Response
- 200 OK
```json
{
  "success": true,
  "files": [
    {
      "id": "<string>",
      "filename": "file_public_id",
      "originalName": "Report.pdf",
      "mimetype": "application/pdf",
      "size": 123456,
      "cloudinaryUrl": "https://res.cloudinary.com/...",
      "uploadedBy": "<userId>",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```
- 401 Unauthorized
```json
{ "success": false, "error": "Unauthorized" }
```

---

#### POST /files/upload
Upload one or more files (multipart/form-data).

Request
- Headers: `Authorization: Bearer <accessToken>`
- Body (multipart): field name `files` can be provided multiple times

Example (cURL)
```bash
curl -X POST \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "files=@/path/to/file1.png" \
  -F "files=@/path/to/file2.pdf" \
  http://localhost:3000/api/files/upload
```

Responses
- 200 OK
```json
{
  "success": true,
  "message": "All files uploaded successfully",
  "files": [
    {
      "id": "<string>",
      "filename": "file_public_id",
      "originalName": "file1.png",
      "mimetype": "image/png",
      "size": 102400,
      "cloudinaryUrl": "https://res.cloudinary.com/...",
      "uploadedBy": "<userId>",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```
- 400 Bad Request
```json
{ "success": false, "error": "No files provided" }
```
- 401 Unauthorized
```json
{ "success": false, "error": "Unauthorized" }
```
- 500 Internal Server Error
```json
{ "success": false, "error": "File upload failed" }
```

Notes
- Limits: 10 files, 10MB per file.

---

#### GET /files/:id
Download a file (owner only). Returns the binary stream.

Request
- Headers: `Authorization: Bearer <accessToken>`

Responses
- 200 OK: Binary data (Content-Type based on file mimetype) and `Content-Disposition: attachment` header
- 403 Forbidden
```json
{ "success": false, "error": "Unauthorized to download this file" }
```
- 404 Not Found
```json
{ "success": false, "error": "File not found" }
```

---

#### DELETE /files/:id
Delete a file (owner only).

Request
- Headers: `Authorization: Bearer <accessToken>`

Responses
- 200 OK
```json
{ "success": true, "message": "File deleted successfully" }
```
- 403 Forbidden
```json
{ "success": false, "error": "Unauthorized to delete this file" }
```
- 404 Not Found
```json
{ "success": false, "error": "File not found" }
```

---

### Tokens and Cookies
- Access Token: Short-lived (~15m). Provide via `Authorization` header.
- Refresh Token: httpOnly cookie (`refreshToken`) with 7-day expiry. Automatically set/rotated by auth endpoints.

### Environment Variables
- `MONGODB_URL`: MongoDB connection string
- `JWT_SECRET`: Secret for signing access tokens
- `REFRESH_SECRET`: Secret for signing refresh tokens
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials

### Error Format
All error responses adhere to:
```json
{ "success": false, "error": "<message>" }
``` 