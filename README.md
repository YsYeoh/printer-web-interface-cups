# CUPS Printer Web Interface

A modern web interface for managing and printing documents through CUPS (Common Unix Printing System). Built with Next.js 14+, TypeScript, and Tailwind CSS.

## Features

- **Authentication System**: Secure login with role-based access control (Admin/Regular users)
- **File Upload**: Drag-and-drop file upload supporting PDF, images, and PostScript files
- **Printer Management**: List and select available CUPS printers
- **Print Configuration**: Advanced print settings including:
  - Copies
  - Color mode (Color/Black & White)
  - Paper size (A4, Letter, Legal, etc.)
  - Orientation (Portrait/Landscape)
  - Scaling (25% - 200%)
  - Print quality (Draft/Normal/High)
  - Margins
- **PDF Preview**: Preview PDF files before printing
- **Account Management**: Admin users can create, edit, and delete user accounts
- **No Database**: Simple JSON-based authentication configuration

## Prerequisites

- Node.js 18+ and npm
- CUPS installed and running on your system
- Unix-like system (Linux, macOS) for CUPS support

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd printer-web-interface-cups
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
JWT_SECRET=your-secret-key-change-in-production
CUPS_SERVER=localhost
CUPS_PORT=631
MAX_FILE_SIZE=52428800
NEXT_PUBLIC_APP_NAME=CUPS Printer Interface
```

4. Initialize authentication:
The app will automatically create a default admin account on first run:
- Username: `admin`
- Password: `admin`

**Important**: Change the default password immediately after first login!

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Login with the default credentials:
   - Username: `admin`
   - Password: `admin`

## Project Structure

```
printer-web-interface-cups/
├── app/
│   ├── (auth)/              # Public routes
│   │   └── login/           # Login page
│   ├── (protected)/         # Protected routes
│   │   ├── dashboard/       # Main print interface
│   │   └── admin/
│   │       └── accounts/    # Account management (admin only)
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── printers/        # Printer listing
│   │   ├── upload/          # File upload
│   │   ├── print/           # Print job submission
│   │   ├── preview/         # File preview
│   │   └── accounts/        # Account management API
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── FileUpload.tsx
│   ├── PrinterSelector.tsx
│   ├── PrintConfig.tsx
│   ├── PDFPreview.tsx
│   └── AccountManager.tsx
├── lib/                     # Utility libraries
│   ├── auth.ts              # Authentication utilities
│   ├── cups.ts              # CUPS integration
│   ├── file-handler.ts      # File management
│   └── types.ts             # TypeScript types
├── config/
│   └── auth.json            # User accounts (auto-generated)
└── temp/                    # Temporary file storage
```

## Usage

### Printing a Document

1. Login to the application
2. Upload a file using the drag-and-drop area
3. Select a printer from the dropdown
4. Configure print settings (copies, color, paper size, etc.)
5. Preview the document (for PDFs)
6. Click "Print" to submit the print job

### Managing Accounts (Admin Only)

1. Navigate to "Manage Accounts" from the dashboard
2. Click "Add User" to create a new account
3. Edit existing users by clicking "Edit"
4. Delete users by clicking "Delete" (you cannot delete your own account)

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for session management
- File uploads are validated for type and size
- Admin-only routes are protected
- Files are stored temporarily and deleted after printing
- Auth config file should be kept secure (excluded from git)

## Configuration

### Authentication

User accounts are stored in `config/auth.json`. This file is automatically created on first run. Admin users can manage accounts through the web interface.

### CUPS Integration

The application uses CUPS commands (`lpstat`, `lp`, `lpoptions`) to interact with printers. Ensure CUPS is running and printers are properly configured.

### File Upload

Supported file types:
- PDF (`.pdf`)
- Images: PNG, JPEG, GIF, BMP, TIFF
- PostScript (`.ps`)

Maximum file size: 50MB (configurable via `MAX_FILE_SIZE`)

## Troubleshooting

### Printers not showing up

- Ensure CUPS is running: `systemctl status cups` (Linux) or `cupsctl --help` (macOS)
- Check printer configuration: `lpstat -p -d`
- Verify CUPS server is accessible

### Authentication issues

- Check that `config/auth.json` exists and is readable
- Verify JWT_SECRET is set in environment variables
- Clear browser cookies and try logging in again

### File upload fails

- Check file size (must be under MAX_FILE_SIZE)
- Verify file type is supported
- Ensure `temp/` directory has write permissions

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
