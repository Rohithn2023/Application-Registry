import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { CreateApplicationRequest } from '@/types/database';

// ============================================
// GET /api/applications — List all with search/filter
// ============================================
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const technology = searchParams.get('technology');
    const isExisting = searchParams.get('is_existing');
    const developer = searchParams.get('developer');

    // Build query
    let query = supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(
        `application_name.ilike.%${search}%,developer_name.ilike.%${search}%,category.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (isExisting !== null && isExisting !== undefined && isExisting !== '') {
      query = query.eq('is_existing', isExisting === 'true');
    }

    if (developer) {
      query = query.ilike('developer_name', `%${developer}%`);
    }

    const { data: applications, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch technologies and relationships for all applications
    const appIds = applications.map((a) => a.id);

    // Fetch technologies
    const { data: appTechs } = await supabase
      .from('application_technologies')
      .select('application_id, technology_id, technologies(id, technology_name, technology_type)')
      .in('application_id', appIds);

    // Fetch relationships
    const { data: appRels } = await supabase
      .from('application_relationships')
      .select('id, application_id, related_application_id, relationship_type, related_app:related_application_id(id, application_name)')
      .in('application_id', appIds);

    // Merge data
    const enrichedApps = applications.map((app) => {
      const techs = (appTechs || [])
        .filter((at) => at.application_id === app.id)
        .map((at) => {
          const tech = at.technologies as unknown as { id: string; technology_name: string; technology_type: string };
          return tech;
        })
        .filter(Boolean);

      const rels = (appRels || [])
        .filter((ar) => ar.application_id === app.id)
        .map((ar) => ({
          id: ar.id,
          relationship_type: ar.relationship_type,
          related_application: ar.related_app as unknown as { id: string; application_name: string },
        }));

      return {
        ...app,
        technologies: techs,
        relationships: rels,
      };
    });

    // If technology filter is applied, filter client-side
    let result = enrichedApps;
    if (technology) {
      result = enrichedApps.filter((app) =>
        app.technologies.some((t: { technology_name?: string; technology_type?: string }) =>
          t.technology_name?.toLowerCase().includes(technology.toLowerCase())
        )
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/applications error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// POST /api/applications — Create new application
// ============================================
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body: CreateApplicationRequest = await request.json();

    // Validate required fields
    if (!body.application_name || !body.developer_name) {
      return NextResponse.json(
        { error: 'Application name and developer name are required' },
        { status: 400 }
      );
    }

    // Insert application
    const { data: app, error: appError } = await supabase
      .from('applications')
      .insert({
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
      .select()
      .single();

    if (appError) {
      return NextResponse.json({ error: appError.message }, { status: 500 });
    }

    // Handle technologies
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

        // Link technology to application
        await supabase.from('application_technologies').insert({
          application_id: app.id,
          technology_id: techId,
        });
      }
    }

    // Handle relationships - Similar Applications
    if (body.similar_applications && body.similar_applications.length > 0) {
      for (const relatedId of body.similar_applications) {
        await supabase.from('application_relationships').insert({
          application_id: app.id,
          related_application_id: relatedId,
          relationship_type: 'Similar To',
        });
      }
    }

    // Handle relationships - Related Applications
    if (body.related_applications && body.related_applications.length > 0) {
      for (const relatedId of body.related_applications) {
        await supabase.from('application_relationships').insert({
          application_id: app.id,
          related_application_id: relatedId,
          relationship_type: 'Related To',
        });
      }
    }

    return NextResponse.json(app, { status: 201 });
  } catch (err) {
    console.error('POST /api/applications error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
