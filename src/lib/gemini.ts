import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  CompetitorData,
  PlatformMetrics,
  SwotAnalysis,
} from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Fetch competitor data via Gemini search grounding
 * Uses Gemini's search capabilities to find social media metrics for competitors
 */
export async function fetchCompetitorData(
  competitorNames: string[],
  platforms: string[],
  industry: string
): Promise<CompetitorData[]> {
  if (competitorNames.length === 0) {
    return [];
  }

  try {
    const platformList = platforms.join(', ');
    const competitorList = competitorNames.join(', ');

    const prompt = `Search for current social media follower counts for the following competitors in the ${industry} industry.
Competitors: ${competitorList}
Platforms: ${platformList}

For each competitor, find their current follower counts across the specified platforms if they have a presence.
Return the data as a JSON array with this structure:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "platforms": [
        {
          "platform": "twitter|facebook|instagram|youtube|tiktok|linkedin",
          "followerCount": 123456,
          "handle": "@handle or username if available"
        }
      ]
    }
  ]
}

Be as accurate as possible with current follower counts. If a competitor doesn't have a presence on a platform, omit that platform from their list.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
      },
    });

    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in Gemini competitor response');
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const competitors: CompetitorData[] = parsed.competitors.map(
      (comp: any) => ({
        name: comp.name,
        platforms: comp.platforms || [],
        totalFollowers: (comp.platforms || []).reduce(
          (sum: number, p: any) => sum + (p.followerCount || 0),
          0
        ),
        dataSource: 'search-derived' as const,
      })
    );

    return competitors;
  } catch (error) {
    console.error('Error fetching competitor data from Gemini:', error);
    return [];
  }
}

/**
 * Generate complete analysis from verified + search-derived data
 * Acts as a senior digital strategist at Majority Strategies
 * Frames weaknesses as opportunities for MS to sell services
 */
export async function generateAnalysis(
  organizationName: string,
  industry: string,
  campaignGoals: string | undefined,
  platformMetrics: PlatformMetrics[],
  competitorData: CompetitorData[]
): Promise<{
  executiveSummary: string;
  swot: SwotAnalysis;
  recommendations: string[];
}> {
  try {
    // Build context strings
    const metricsContext = platformMetrics
      .map(
        (m) =>
          `${m.platform}: ${m.followerCount.toLocaleString()} followers, ${m.engagementRate.toFixed(2)}% engagement rate, ${m.postsPerWeek.toFixed(1)} posts/week`
      )
      .join('\n');

    const competitorContext = competitorData
      .map(
        (c) =>
          `${c.name}: ${c.totalFollowers.toLocaleString()} total followers across platforms (${c.platforms.map((p) => `${p.platform}: ${p.followerCount.toLocaleString()}`).join(', ')})`
      )
      .join('\n');

    const campaignGoalsContext = campaignGoals
      ? `Campaign Goals: ${campaignGoals}`
      : 'No specific campaign goals provided.';

    const systemPrompt = `You are a senior digital strategist at Majority Strategies, a leading political marketing agency.
Your expertise is in social media strategy, audience engagement, and digital campaign execution.
Your role is to analyze social media presence and identify strategic opportunities.
Frame all weaknesses as SALES OPPORTUNITIES where Majority Strategies can step in to help.
Be specific with numbers and data points. Focus on actionable insights that could lead to service engagements.`;

    const analysisPrompt = `Analyze the following social media audit data for ${organizationName} in the ${industry} industry:

CURRENT SOCIAL MEDIA METRICS:
${metricsContext}

COMPETITOR BENCHMARKS:
${competitorContext}

${campaignGoalsContext}

Based on this data, provide:

1. EXECUTIVE SUMMARY (exactly 5 sentences following this structure):
   - Sentence 1: Current presence with audience size across platforms
   - Sentence 2: Key observation about their content strategy
   - Sentence 3: How they compare to competitors
   - Sentence 4: A specific gap or opportunity identified
   - Sentence 5: Clear call to action for Majority Strategies services

2. SWOT ANALYSIS:
   Return as JSON object with this structure:
   {
     "strengths": [
       {"text": "description with numbers", "dataSource": "api-verified|calculated|benchmark|observation"},
       ...
     ],
     "weaknesses": [
       {"text": "description with numbers", "dataSource": "api-verified|calculated|benchmark|observation"},
       ...
     ],
     "opportunities": [
       {"text": "description with numbers", "dataSource": "api-verified|calculated|benchmark|observation"},
       ...
     ],
     "threats": [
       {"text": "description with numbers", "dataSource": "api-verified|calculated|benchmark|observation"},
       ...
     ]
   }

3. RECOMMENDATIONS (3-5 actionable items):
   - Each should be specific and measurable
   - Focus on areas where Majority Strategies can provide value
   - Include realistic timelines or metrics

Format your response as:
EXECUTIVE_SUMMARY: [5 sentences here]
SWOT_JSON: [JSON object here]
RECOMMENDATIONS: [numbered list here]`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: systemPrompt + '\n\n' + analysisPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse response sections
    const executiveSummaryMatch = responseText.match(
      /EXECUTIVE_SUMMARY:\s*([\s\S]*?)(?=SWOT_JSON:|$)/
    );
    const executiveSummary = executiveSummaryMatch
      ? executiveSummaryMatch[1].trim()
      : '';

    const swotJsonMatch = responseText.match(
      /SWOT_JSON:\s*(\{[\s\S]*?\})(?=RECOMMENDATIONS:|$)/
    );
    let swot: SwotAnalysis = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };

    if (swotJsonMatch) {
      try {
        const swotData = JSON.parse(swotJsonMatch[1]);
        swot = {
          strengths: (swotData.strengths || []).map((item: any) => ({
            text: item.text,
            source: item.dataSource || item.source || 'OBSERVED',
          })),
          weaknesses: (swotData.weaknesses || []).map((item: any) => ({
            text: item.text,
            source: item.dataSource || item.source || 'OBSERVED',
          })),
          opportunities: (swotData.opportunities || []).map((item: any) => ({
            text: item.text,
            source: item.dataSource || item.source || 'OBSERVED',
          })),
          threats: (swotData.threats || []).map((item: any) => ({
            text: item.text,
            source: item.dataSource || item.source || 'OBSERVED',
          })),
        };
      } catch (e) {
        console.error('Error parsing SWOT JSON:', e);
      }
    }

    const recommendationsMatch = responseText.match(
      /RECOMMENDATIONS:\s*([\s\S]*?)$/
    );
    const recommendationsText = recommendationsMatch
      ? recommendationsMatch[1].trim()
      : '';
    const recommendations = recommendationsText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((line) => line.length > 0);

    return {
      executiveSummary,
      swot,
      recommendations,
    };
  } catch (error) {
    console.error('Error generating analysis from Gemini:', error);
    throw new Error(`Failed to generate analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
