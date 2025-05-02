import { NextResponse } from 'next/server';
import { persistDailyStats } from '@/lib/actions/stats';

export async function GET() {
  try {
    const result = await persistDailyStats();
    
    return NextResponse.json({ 
      success: true, 
      message: result.message,
    });
  } catch (error) {
    console.error('Error persisting stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to persist stats.', error: error.message },
      { status: 500 }
    );
  }
}