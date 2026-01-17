import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { listPrinters, isCupsAvailable } from '@/lib/cups';

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

    // Check CUPS availability
    const cupsOnline = await isCupsAvailable();
    
    // Get printers
    const printers = await listPrinters();
    
    // Count online printers (idle or printing status)
    const onlinePrinters = printers.filter(
      (p) => p.status === 'idle' || p.status === 'printing'
    ).length;

    return NextResponse.json({
      cupsOnline,
      printers: printers.map((p) => ({
        name: p.name,
        status: p.status || 'unknown',
        description: p.description,
      })),
      totalPrinters: printers.length,
      onlinePrinters,
    });
  } catch (error) {
    console.error('Error fetching CUPS status:', error);
    return NextResponse.json(
      {
        cupsOnline: false,
        printers: [],
        totalPrinters: 0,
        onlinePrinters: 0,
        error: 'Failed to fetch CUPS status',
      },
      { status: 500 }
    );
  }
}

