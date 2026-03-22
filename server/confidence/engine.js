const parsingConfidence = require('./parsingConfidence');
const translationConfidence = require('./translationConfidence');
const validationConfidence = require('./validationConfidence');

function calculateConfidence(inputText, parsedResult, inputType, ocrConfidence) {
  const parsing = parsingConfidence.calculate(inputText, inputType, ocrConfidence);
  const translation = translationConfidence.calculate(parsedResult);
  const validation = validationConfidence.calculate(parsedResult);

  // Weighted composite
  let composite = 0.35 * parsing.score + 0.35 * translation.score + 0.30 * validation.score;

  // Penalty adjustments
  const penalties = [];

  // -5 if cash flow does not reconcile
  if (parsedResult?.reconciliation && !parsedResult.reconciliation.balances) {
    composite -= 0.05;
    penalties.push('Cash flow does not reconcile (-5)');
  }

  // -5 if more than 20% of rows flagged
  const allItems = [
    ...(parsedResult?.convertedSections?.operating?.items || []),
    ...(parsedResult?.convertedSections?.investing?.items || []),
    ...(parsedResult?.convertedSections?.financing?.items || []),
  ];
  const flaggedRatio = allItems.length > 0
    ? allItems.filter(i => i.flagged).length / allItems.length
    : 0;
  if (flaggedRatio > 0.2) {
    composite -= 0.05;
    penalties.push('More than 20% of rows flagged as uncertain (-5)');
  }

  // -3 if OCR/parsing quality is poor
  if (parsing.score < 0.35) {
    composite -= 0.03;
    penalties.push('Poor input parsing quality (-3)');
  }

  // -4 if major line items missing
  const labels = allItems.map(i => i.label.toLowerCase()).join(' ');
  const hasCashFromOps = labels.includes('operating') || labels.includes('net income') || labels.includes('net cash');
  if (!hasCashFromOps && allItems.length > 0) {
    composite -= 0.04;
    penalties.push('Major line items may be missing (-4)');
  }

  // -2 if ambiguous labels exceed threshold
  const ambiguousCount = allItems.filter(i => i.flagged && i.flagReason).length;
  if (ambiguousCount > 3) {
    composite -= 0.02;
    penalties.push('Multiple ambiguous label classifications (-2)');
  }

  // -2 if sections were inferred
  if (parsedResult?.assumptions?.some(a => a.toLowerCase().includes('section') || a.toLowerCase().includes('inferred'))) {
    composite -= 0.02;
    penalties.push('Sections were inferred rather than clearly present (-2)');
  }

  // Clamp
  composite = Math.max(0, Math.min(1, composite));

  const overall = Math.round(composite * 100);

  return {
    overall,
    label: overall >= 80 ? 'High' : overall >= 55 ? 'Medium' : 'Low',
    cashFlow: overall,
    breakdown: {
      parsing: { score: Math.round(parsing.score * 100), findings: parsing.findings },
      translation: { score: Math.round(translation.score * 100), findings: translation.findings },
      validation: { score: Math.round(validation.score * 100), findings: validation.findings },
    },
    penalties,
    drivers: [
      ...parsing.findings.slice(0, 2),
      ...translation.findings.slice(0, 2),
      ...validation.findings.slice(0, 2),
      ...penalties,
    ],
  };
}

module.exports = { calculateConfidence };
