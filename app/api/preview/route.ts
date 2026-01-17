import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import fs from 'fs-extra';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filePathParam = searchParams.get('file');

    if (!filePathParam) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    // Decode URL-encoded file path
    const filePath = decodeURIComponent(filePathParam);

    // Security: Ensure file is in temp directory
    const tempDir = path.join(process.cwd(), 'temp');
    const resolvedPath = path.resolve(filePath);
    const resolvedTempDir = path.resolve(tempDir);

    if (!resolvedPath.startsWith(resolvedTempDir)) {
      console.error('Path security check failed:', {
        resolvedPath,
        resolvedTempDir,
        filePath,
      });
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    if (!(await fs.pathExists(filePath))) {
      console.error('File not found:', filePath);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // Determine content type
    let contentType = 'application/pdf';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.bmp') contentType = 'image/bmp';
    else if (ext === '.tiff' || ext === '.tif') contentType = 'image/tiff';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
      },
    });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to load preview' },
      { status: 500 }
    );
  }
}

