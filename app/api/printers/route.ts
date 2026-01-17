import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { listPrinters } from '@/lib/cups';

export async function GET() {
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

    const printers = await listPrinters();
    return NextResponse.json({ printers });
  } catch (error) {
    console.error('Error listing printers:', error);
    return NextResponse.json(
      { error: 'Failed to list printers' },
      { status: 500 }
    );
  }
}

