function calculate(parsedResult) {
  const findings = [];

  if (!parsedResult || !parsedResult.convertedSections) {
    return { score: 0.2, findings: ['No conversion result to evaluate'] };
  }

  const sections = parsedResult.convertedSections;
  const allItems = [
    ...(sections.operating?.items || []),
    ...(sections.investing?.items || []),
    ...(sections.financing?.items || []),
  ];

  const totalItems = allItems.length;
  if (totalItems === 0) {
    return { score: 0.2, findings: ['No line items in conversion result'] };
  }

  // Flagged row ratio
  const flaggedCount = allItems.filter(item => item.flagged).length;
  const flaggedRatio = flaggedCount / totalItems;
  let flaggedScore;
  if (flaggedRatio === 0) flaggedScore = 1.0;
  else if (flaggedRatio <= 0.1) flaggedScore = 0.85;
  else if (flaggedRatio <= 0.2) flaggedScore = 0.65;
  else if (flaggedRatio <= 0.4) flaggedScore = 0.45;
  else flaggedScore = 0.25;
  findings.push(`${flaggedCount}/${totalItems} rows flagged as uncertain`);

  // Note completeness for reclassified items
  const reclassified = allItems.filter(
    item => item.originalSection && item.originalSection !== getSectionForItem(item, sections)
  );
  const notedReclassified = reclassified.filter(item => item.notes && item.notes.trim());
  const noteScore = reclassified.length > 0
    ? notedReclassified.length / reclassified.length
    : 1.0;
  if (reclassified.length > 0) {
    findings.push(`${reclassified.length} items reclassified, ${notedReclassified.length} with explanations`);
  }

  // Known item handling
  const knownItems = ['interest', 'dividend', 'tax', 'lease'];
  const itemLabels = allItems.map(item => item.label.toLowerCase());
  const handledKnown = knownItems.filter(ki =>
    itemLabels.some(label => label.includes(ki))
  );
  const knownScore = handledKnown.length / knownItems.length;
  findings.push(`Key items addressed: ${handledKnown.join(', ') || 'none'} (${handledKnown.length}/${knownItems.length})`);

  // Assumptions count
  const assumptions = parsedResult.assumptions || [];
  let assumptionScore;
  if (assumptions.length === 0) assumptionScore = 1.0;
  else if (assumptions.length <= 2) assumptionScore = 0.8;
  else if (assumptions.length <= 5) assumptionScore = 0.6;
  else assumptionScore = 0.4;
  if (assumptions.length > 0) {
    findings.push(`${assumptions.length} assumptions made during conversion`);
  }

  const score =
    0.35 * flaggedScore +
    0.20 * noteScore +
    0.25 * knownScore +
    0.20 * assumptionScore;

  return { score: Math.max(0, Math.min(1, score)), findings };
}

function getSectionForItem(item, sections) {
  for (const [sectionName, section] of Object.entries(sections)) {
    if (section.items && section.items.includes(item)) return sectionName;
  }
  return null;
}

module.exports = { calculate };
