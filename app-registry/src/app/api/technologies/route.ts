import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// ============================================
// GET /api/technologies — List all technologies
// ============================================
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: technologies, error } = await supabase
      .from('technologies')
      .select('*')
      .order('technology_type')
      .order('technology_name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(technologies);
  } catch (err) {
    console.error('GET /api/technologies error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
