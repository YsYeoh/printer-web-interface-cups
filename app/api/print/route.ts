import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { printFile, isCupsAvailable } from '@/lib/cups';
import { deleteFile } from '@/lib/file-handler';
import { PrintOptions } from '@/lib/types';

export async function POST(request: NextRequest) {
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

    // Check if CUPS is online
    const cupsOnline = await isCupsAvailable();
    if (!cupsOnline) {
      return NextResponse.json(
        { error: 'CUPS is not online. Cannot print. Please check CUPS status.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { filePath, printerName, options } = body as {
      filePath: string;
      printerName: string;
      options: PrintOptions;
    };

    if (!filePath || !printerName || !options) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const jobId = await printFile(filePath, printerName, options);

    // Delete file after printing
    await deleteFile(filePath);

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Print job submitted successfully',
    });
  } catch (error) {
    console.error('Print error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Print failed' },
      { status: 500 }
    );
  }
}

