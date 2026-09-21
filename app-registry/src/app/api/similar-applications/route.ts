import { NextRequest, NextResponse } from 'next/server';
import { searchExternalSimilarApplications } from '@/lib/webSearchSimilarity';

/**
 * POST /api/similar-applications
 *
 * Dedicated backend endpoint for external web search for similar real-world applications.
 * ZERO dependency on internal Application Registry or database.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicationName,
      applicationType,
      category,
      description,
      purpose,
      coreFunctions,
    } = body;

    if (!applicationName && !purpose && !description) {
      return NextResponse.json(
        {
          source: 'web',
          results: [],
          error: 'Application name or description is required for similarity search.',
        },
        { status: 400 }
      );
    }

    // Call pure external web search service
    const searchResponse = await searchExternalSimilarApplications({
      applicationName: applicationName || '',
      applicationType: applicationType || '',
      category: category || '',
      description: description || '',
      purpose: purpose || '',
      coreFunctions: Array.isArray(coreFunctions) ? coreFunctions : [],
    });

    return NextResponse.json(searchResponse);
  } catch (error: unknown) {
    console.error('[SIMILARITY] Error in /api/similar-applications:', error);
    return NextResponse.json(
      {
        source: 'web',
        results: [],
        error: 'Unable to retrieve real-world similar applications at this time.',
      },
      { status: 500 }
    );
  }
}
