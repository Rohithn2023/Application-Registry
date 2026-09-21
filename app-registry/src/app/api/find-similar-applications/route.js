import { NextResponse } from 'next/server';
import { searchExternalSimilarApplications } from '@/lib/webSearchSimilarity';

export async function POST(request) {
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
          error: 'Application name or description is required to find similar applications.',
        },
        { status: 400 }
      );
    }

    // Perform live real-time web search for similar real-world applications (ZERO database queries)
    const searchResponse = await searchExternalSimilarApplications({
      applicationName: applicationName || '',
      applicationType: applicationType || '',
      category: category || '',
      description: description || '',
      purpose: purpose || '',
      coreFunctions: Array.isArray(coreFunctions) ? coreFunctions : [],
    });

    return NextResponse.json({
      source: searchResponse.source,
      results: searchResponse.results,
      applicationName,
      similarApplications: searchResponse.results,
      error: searchResponse.error,
    });
  } catch (error) {
    console.error('[SIMILARITY] Error finding similar applications via web search:', error);
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
