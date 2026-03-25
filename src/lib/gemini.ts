import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  CompetitorData,
  PlatformMetrics,
  SwotAnalysis,
} from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

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

    console.log('[competitors] Fetching data for:', competitorList, 'on platforms:', platformList);

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

    console.log('[competitors] Gemini response length:', responseText.length);

    // Extract JSON from response — use robust brace-matching
    const jsonStr = extractJsonObject(responseText);
    if (!jsonStr) {
      console.warn('[competitors] No JSON found in Gemini response. First 300 chars:', responseText.substring(0, 300));
      return [];
    }

    const parsed = JSON.parse(jsonStr);
    const competitors: CompetitorData[] = (parsed.competitors || []).map(
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

    console.log('[competitors] Parsed', competitors.length, 'competitors:', competitors.map(c => `${c.name}: ${c.totalFollowers} followers`));
    return competitors;
  } catch (error) {
    console.error('Error fetching competitor data from Gemini:', error);
    return [];
  }
}

/**
 * Extract the outermost JSON object from a string, handling nested braces correctly.
 */
function extractJsonObject(text: string): string | null {
  const startIdx = text.indexOf('{');
  if (startIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return text.substring(startIdx, i + 1);
    }
  }
  return null;
}

/**
 * Generate complete analysis from verified + search-derived data
 * Acts as a senior digital strategist at Majority Strategies
 * Uses Patrick's SWOT logic framework for structured, actionable analysis
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

    const analysisPrompt = `You are a senior digital strategist at Majority Strategies, a leading political marketing agency.
Your expertise is in social media strategy, audience engagement, and digital campaign execution.
Frame all weaknesses as SALES OPPORTUNITIES where Majority Strategies can step in to help.
Be specific with numbers and data points. Focus on actionable insights.

Analyze the following social media audit data for ${organizationName} in the ${industry} industry:

CURRENT SOCIAL MEDIA METRICS:
${metricsContext || 'No platform metrics available.'}

COMPETITOR BENCHMARKS:
${competitorContext || 'No competitor data available.'}

${campaignGoalsContext}

Provide your analysis in EXACTLY this format (do not deviate):

EXECUTIVE_SUMMARY:
[Write exactly 5 sentences:
1. Current presence with audience size across platforms
2. Key observation about their content strategy
3. How they compare to competitors
4. A specific gap or opportunity identified
5. Clear call to action for Majority Strategies services]

SWOT_JSON:
[Return a single JSON object — no markdown code fences, no backticks. MUST contain 3-5 items per category.]

IMPORTANT SWOT RULES (from Majority Strategies playbook):

STRENGTHS — Look for these indicators:
- High follower count (10,000+ per platform = established audience)
- Consistent engagement (50+ likes, several comments/shares per post)
- Consistent posting frequency (regular posts, consistent times)
- High video views (1,000+ views for 10k+ follower accounts)
- Impressions exceeding followers (content reaching beyond existing audience)
DO NOT list as strength: high followers with low engagement, presence on platforms with low followers.
Use professional language like: "${organizationName} has X followers across platforms, ranking towards the higher end of the competition."

WEAKNESSES — Look for these indicators:
- Platform inactivity (missing major platforms where competitors are active)
- Single content format (only links, only static graphics)
- Generic/excessive hashtag usage
- High posting frequency but low engagement (content not resonating)
- High followers but low engagement (potentially inauthentic followers)
Frame constructively. NEVER claim trends without comparing two time periods.
Use language like: "${organizationName} doesn't utilize a diverse range of content, frequently posting links that hurt reach."

OPPORTUNITIES — Connect to MS services:
- Full-service social media management
- Custom content calendars (data-driven posting schedules)
- Social media account creation (professional setup on new platforms)
- Short-form video production (Reels, TikTok, YouTube Shorts)
- Graphic design for social media (custom visual assets)
Pattern: inactive = needs management; low engagement = needs content help; few followers = needs growth strategy.
Use aspirational language about installing professional management layers and data-driven content roadmaps.

THREATS — Focus on:
- Not maximizing video content (missing algorithm-favored format)
- Failing to participate in trends (appearing out of touch)
- Outdated strategies (hashtag stuffing, follow-for-follow)
- AI-generated text overuse (appears inauthentic)
- Prioritizing views over engagement (shares/comments/saves signal value, not impressions)
DO NOT mention: fake followers, SEO, shadowbans.
Create urgency without fear-mongering.

The JSON structure must be:
{"strengths":[{"text":"specific finding with numbers","dataSource":"api-verified"}],"weaknesses":[{"text":"specific finding","dataSource":"observation"}],"opportunities":[{"text":"MS service opportunity","dataSource":"benchmark"}],"threats":[{"text":"industry threat","dataSource":"observation"}]}

RECOMMENDATIONS:
[3-5 numbered items. Each specific, measurable, with timelines. Focus on areas where Majority Strategies provides value.]`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: analysisPrompt }],
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

    console.log('Gemini response length:', responseText.length);

    // Parse EXECUTIVE SUMMARY
    const executiveSummaryMatch = responseText.match(
      /EXECUTIVE_SUMMARY:\s*([\s\S]*?)(?=SWOT_JSON:|$)/
    );
    const executiveSummary = executiveSummaryMatch
      ? executiveSummaryMatch[1].trim()
      : '';

    // Parse SWOT JSON — use robust brace-matching parser
    let swot: SwotAnalysis = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };

    const swotSection = responseText.match(/SWOT_JSON:\s*([\s\S]*?)(?=RECOMMENDATIONS:|$)/);
    if (swotSection) {
      const rawSwotText = swotSection[1]
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const jsonStr = extractJsonObject(rawSwotText);
      if (jsonStr) {
        try {
          const swotData = JSON.parse(jsonStr);
          const mapItems = (items: any[]) =>
            (items || []).map((item: any) => ({
              text: typeof item === 'string' ? item : (item.text || ''),
              source: item.dataSource || item.source || 'OBSERVED',
            })).filter((item: any) => item.text.length > 0);

          swot = {
            strengths: mapItems(swotData.strengths),
            weaknesses: mapItems(swotData.weaknesses),
            opportunities: mapItems(swotData.opportunities),
            threats: mapItems(swotData.threats),
          };
          console.log('SWOT parsed successfully:', {
            strengths: swot.strengths.length,
            weaknesses: swot.weaknesses.length,
            opportunities: swot.opportunities.length,
            threats: swot.threats.length,
          });
        } catch (e) {
          console.error('Error parsing SWOT JSON:', e, 'Raw JSON string:', jsonStr.substring(0, 200));
        }
      } else {
        console.error('Could not extract JSON object from SWOT section. Raw text:', rawSwotText.substring(0, 300));
      }
    } else {
      console.error('No SWOT_JSON section found in response. Full response:', responseText.substring(0, 500));
    }

    // Parse RECOMMENDATIONS
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
