export interface AspectSentiment {
  aspect: string;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  overall: 'positive' | 'neutral' | 'negative';
}

export function analyzeReviewAspects(reviews: { comment: string; rating: number }[]): AspectSentiment[] {
  if (!reviews || reviews.length === 0) return [];

  const aspectsMap: Record<string, { pos: number; neg: number; neu: number }> = {
    'Photo Quality': { pos: 0, neg: 0, neu: 0 },
    'Staff Service': { pos: 0, neg: 0, neu: 0 },
    'Waiting Time': { pos: 0, neg: 0, neu: 0 },
    'Price & Value': { pos: 0, neg: 0, neu: 0 },
    'Print Quality': { pos: 0, neg: 0, neu: 0 },
  };

  const keywords = {
    'Photo Quality': ['photo', 'quality', 'lighting', 'camera', 'props', 'frame', 'cute', 'clear'],
    'Staff Service': ['staff', 'polite', 'helpful', 'service', 'friendly', 'owner'],
    'Waiting Time': ['crowded', 'queue', 'wait', 'waiting', 'line', 'busy', 'weekend'],
    'Price & Value': ['price', 'budget', 'affordable', 'cheap', 'worth', 'cost', 'expensive'],
    'Print Quality': ['print', 'paper', 'color', 'strip', 'download', 'qr'],
  };

  const posWords = ['great', 'amazing', 'love', 'loved', 'good', 'super', 'best', 'polite', 'helpful', 'clean', 'affordable', 'instant', 'quality'];
  const negWords = ['bad', 'crowded', 'slow', 'expensive', 'long wait', 'poor', 'dirty', 'broken'];

  for (const r of reviews) {
    const text = r.comment.toLowerCase();
    for (const [aspectName, kwList] of Object.entries(keywords)) {
      const mentionsAspect = kwList.some((kw) => text.includes(kw));
      if (mentionsAspect) {
        const isPos = posWords.some((w) => text.includes(w)) || r.rating >= 4;
        const isNeg = negWords.some((w) => text.includes(w)) || r.rating <= 2;

        if (isPos && !isNeg) aspectsMap[aspectName].pos++;
        else if (isNeg) aspectsMap[aspectName].neg++;
        else aspectsMap[aspectName].neu++;
      }
    }
  }

  const results: AspectSentiment[] = [];
  for (const [aspect, counts] of Object.entries(aspectsMap)) {
    const total = counts.pos + counts.neg + counts.neu;
    if (total > 0) {
      let overall: 'positive' | 'neutral' | 'negative' = 'neutral';
      if (counts.pos > counts.neg) overall = 'positive';
      else if (counts.neg > counts.pos) overall = 'negative';

      results.push({
        aspect,
        positiveCount: counts.pos,
        negativeCount: counts.neg,
        neutralCount: counts.neu,
        overall,
      });
    }
  }

  return results;
}
