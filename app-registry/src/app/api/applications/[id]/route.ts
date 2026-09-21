import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { UpdateApplicationRequest } from '@/types/database';

// ============================================
// GET /api/applications/[id] — Get single application
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { id } = await params;

    // Fetch application
    const { data: app, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Fetch technologies
    const { data: appTechs } = await supabase
      .from('application_technologies')
      .select('technology_id, technologies(id, technology_name, technology_type)')
      .eq('application_id', id);

    const technologies = (appTechs || []).map((at) => {
      return at.technologies as unknown as { id: string; technology_name: string; technology_type: string };
    });

    // Fetch relationships
    const { data: appRels } = await supabase
      .from('application_relationships')
      .select('id, application_id, related_application_id, relationship_type, related_app:related_application_id(id, application_name)')
      .eq('application_id', id);

    const relationships = (appRels || []).map((ar) => ({
      id: ar.id,
      relationship_type: ar.relationship_type,
      related_application: ar.related_app as unknown as { id: string; application_name: string },
    }));

    return NextResponse.json({
      ...app,
      technologies,
      relationships,
    });
  } catch (err) {
    console.error('GET /api/applications/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// PUT /api/applications/[id] — Update application
// ============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { id } = await params;
    const body: UpdateApplicationRequest = await request.json();

    // Validate required fields
    if (!body.application_name || !body.developer_name) {
      return NextResponse.json(
        { error: 'Application name and developer name are required' },
        { status: 400 }
      );
    }

    // Update application
    const { data: app, error: appError } = await supabase
      .from('applications')
      .update({
        application_name: body.application_name,
        description: body.description || null,
        developer_name: body.developer_name,
        development_team: body.development_team || null,
        category: body.category || null,
        status: body.status || 'Active',
        version: body.version || '1.0',
        purpose: body.purpose || null,
        is_existing: body.is_existing ?? true,
        additional_notes: body.additional_notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (appError) {
      return NextResponse.json({ error: appError.message }, { status: 500 });
    }

    // Update technologies - remove old ones and add new ones
    await supabase
      .from('application_technologies')
      .delete()
      .eq('application_id', id);

    if (body.technologies && body.technologies.length > 0) {
      for (const tech of body.technologies) {
        // Upsert technology
        const { data: existingTech } = await supabase
          .from('technologies')
          .select('id')
          .eq('technology_name', tech.technology_name)
          .eq('technology_type', tech.technology_type)
          .single();

        let techId: string;

        if (existingTech) {
          techId = existingTech.id;
        } else {
          const { data: newTech, error: techError } = await supabase
            .from('technologies')
            .insert({
              technology_name: tech.technology_name,
              technology_type: tech.technology_type,
            })
            .select()
            .single();

          if (techError) continue;
          techId = newTech.id;
        }

        await supabase.from('application_technologies').insert({
          application_id: id,
          technology_id: techId,
        });
      }
    }

    // Update relationships - remove old ones and add new ones
    await supabase
      .from('application_relationships')
      .delete()
      .eq('application_id', id);

    if (body.similar_applications && body.similar_applications.length > 0) {
      for (const relatedId of body.similar_applications) {
        await supabase.from('application_relationships').insert({
          application_id: id,
          related_application_id: relatedId,
          relationship_type: 'Similar To',
        });
      }
    }

    if (body.related_applications && body.related_applications.length > 0) {
      for (const relatedId of body.related_applications) {
        await supabase.from('application_relationships').insert({
          application_id: id,
          related_application_id: relatedId,
          relationship_type: 'Related To',
        });
      }
    }

    return NextResponse.json(app);
  } catch (err) {
    console.error('PUT /api/applications/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE /api/applications/[id] — Delete application
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { id } = await params;

    // Delete related records first (cascade should handle this, but being explicit)
    await supabase
      .from('application_technologies')
      .delete()
      .eq('application_id', id);

    await supabase
      .from('application_relationships')
      .delete()
      .eq('application_id', id);

    // Also remove relationships where this app is the related one
    await supabase
      .from('application_relationships')
      .delete()
      .eq('related_application_id', id);

    // Delete the application
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/applications/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
