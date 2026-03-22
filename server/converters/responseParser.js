function parseGeminiResponse(rawText) {
  // Strategy 1: Direct parse
  try {
    const data = JSON.parse(rawText);
    return { success: true, data };
  } catch {}

  // Strategy 2: Extract from markdown code fence
  const codeFenceMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeFenceMatch) {
    try {
      const data = JSON.parse(codeFenceMatch[1]);
      return { success: true, data };
    } catch {}
  }

  // Strategy 3: Find first { and last }
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const data = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      return { success: true, data };
    } catch {}
  }

  return {
    success: false,
    error: 'Failed to parse Gemini response as JSON',
    rawText,
  };
}

function validateResponse(data) {
  const errors = [];

  if (!data.metadata) errors.push('Missing metadata');
  if (!data.convertedSections) errors.push('Missing convertedSections');
  if (!data.reconciliation) errors.push('Missing reconciliation');

  if (data.convertedSections) {
    for (const section of ['operating', 'investing', 'financing']) {
      if (!data.convertedSections[section]) {
        errors.push(`Missing section: ${section}`);
      } else if (!Array.isArray(data.convertedSections[section].items)) {
        errors.push(`Section ${section} missing items array`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { parseGeminiResponse, validateResponse };
