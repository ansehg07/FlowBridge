function calculate(inputText, inputType, ocrConfidence) {
  const findings = [];
  const lines = inputText.split('\n').filter(l => l.trim());

  // Numeric density: ratio of lines containing numbers
  const numericLines = lines.filter(l => /[\d,]+\.?\d*/.test(l));
  const numericDensity = lines.length > 0 ? numericLines.length / lines.length : 0;
  let numericScore;
  if (numericDensity > 0.4) numericScore = 1.0;
  else if (numericDensity > 0.25) numericScore = 0.8;
  else if (numericDensity > 0.1) numericScore = 0.5;
  else numericScore = 0.2;
  findings.push(`Numeric density: ${(numericDensity * 100).toFixed(0)}% of lines contain numbers`);

  // Section headers detected
  const sectionKeywords = ['operating', 'investing', 'financing'];
  const foundSections = sectionKeywords.filter(kw =>
    lines.some(l => l.toLowerCase().includes(kw))
  );
  let sectionScore;
  if (foundSections.length === 3) sectionScore = 1.0;
  else if (foundSections.length === 2) sectionScore = 0.7;
  else if (foundSections.length === 1) sectionScore = 0.4;
  else sectionScore = 0.15;
  findings.push(`Section headers: ${foundSections.length}/3 detected (${foundSections.join(', ') || 'none'})`);

  // Line count adequacy
  let lineScore;
  if (lines.length >= 8 && lines.length <= 60) lineScore = 1.0;
  else if (lines.length >= 5) lineScore = 0.8;
  else if (lines.length >= 3) lineScore = 0.5;
  else lineScore = 0.2;
  findings.push(`Line count: ${lines.length} lines`);

  // Input type baseline
  let typeScore;
  switch (inputType) {
    case 'excel':
    case 'csv':
      typeScore = 0.95;
      findings.push('Structured input (spreadsheet) — high baseline quality');
      break;
    case 'text':
      typeScore = 0.80;
      findings.push('Text paste input — medium-high baseline quality');
      break;
    case 'pdf':
      typeScore = 0.65;
      findings.push('PDF extraction — medium baseline quality');
      break;
    case 'image':
      typeScore = ocrConfidence ? ocrConfidence / 100 : 0.4;
      findings.push(`OCR input — baseline quality ${ocrConfidence ? ocrConfidence.toFixed(0) + '%' : 'unknown'}`);
      break;
    default:
      typeScore = 0.5;
  }

  // Noise ratio: lines that look non-financial
  const noisePatterns = /^(page \d|©|all rights|confidential|draft|www\.|http)/i;
  const noiseLines = lines.filter(l => noisePatterns.test(l.trim()));
  const noiseRatio = lines.length > 0 ? noiseLines.length / lines.length : 0;
  const noiseScore = Math.max(0, 1 - noiseRatio * 5);
  if (noiseLines.length > 0) {
    findings.push(`${noiseLines.length} noise lines detected (headers/footers/URLs)`);
  }

  const score =
    0.25 * numericScore +
    0.25 * sectionScore +
    0.15 * lineScore +
    0.20 * typeScore +
    0.15 * noiseScore;

  return { score: Math.max(0, Math.min(1, score)), findings };
}

module.exports = { calculate };
