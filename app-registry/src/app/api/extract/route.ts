import { NextRequest, NextResponse } from 'next/server';
import { extractRawTextFromBuffer, parseApplicationMetadata } from '@/lib/extractor';
import { searchExternalSimilarApplications } from '@/lib/similarityService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No document file provided. Please upload a PDF or PPTX file.' },
        { status: 400 }
      );
    }

    const filename = file.name;
    const lowerName = filename.toLowerCase();

    if (
      !lowerName.endsWith('.pdf') &&
      !lowerName.endsWith('.pptx') &&
      !lowerName.endsWith('.ppt')
    ) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a PDF or PPT/PPTX document.' },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract raw text
    const rawText = await extractRawTextFromBuffer(buffer, filename, file.type);

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not extract text from this document. Please ensure it contains readable text (not scanned images only).',
        },
        { status: 422 }
      );
    }

    // Parse application metadata from the uploaded document
    const extractedData = await parseApplicationMetadata(rawText, filename);

    // Discover similar real-world applications via REAL-TIME LIVE WEB SEARCH (ZERO database query)
    const webSearchResponse = await searchExternalSimilarApplications({
      applicationName: extractedData.application_name,
      applicationType: extractedData.business_domain || extractedData.category,
      category: extractedData.category,
      description: extractedData.description,
      purpose: extractedData.purpose,
      coreFunctions: extractedData.core_functions,
    });

    const similarRealWorldApps = webSearchResponse.results || [];

    // Attach real-world similar applications (NO database IDs or registry records)
    const enrichedData = {
      ...extractedData,
      similar_applications: [], // No database IDs
      similar_app_details: similarRealWorldApps.map((item) => ({
        id: item.name,
        application_name: item.name,
        category: item.category,
        description: item.description,
        website: item.website || item.sourceUrl,
        similarity_reason: item.reason || item.similarityReason,
        match_reason: item.reason || item.similarityReason,
        source: item.source,
        similarityScore: item.similarityScore,
      })),
      similar_real_world_apps: similarRealWorldApps,
      similar_real_world_source: 'web',
    };

    return NextResponse.json({
      success: true,
      filename,
      extracted: enrichedData,
      previewSnippet: rawText.slice(0, 300),
    });
  } catch (error) {
    console.error('Extraction error:', error);
    const message = error instanceof Error ? error.message : 'Failed to extract document';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
