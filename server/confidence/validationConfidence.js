function calculate(parsedResult) {
  const findings = [];

  if (!parsedResult || !parsedResult.convertedSections) {
    return { score: 0.2, findings: ['No conversion result to validate'] };
  }

  const sections = parsedResult.convertedSections;

  // Total reconciliation
  const opSubtotal = sections.operating?.subtotal || 0;
  const invSubtotal = sections.investing?.subtotal || 0;
  const finSubtotal = sections.financing?.subtotal || 0;
  const computedNet = opSubtotal + invSubtotal + finSubtotal;
  const reportedNet = parsedResult.reconciliation?.netChangeInCash;

  let reconScore = 0.5;
  if (reportedNet !== undefined && reportedNet !== null) {
    const diff = Math.abs(computedNet - reportedNet);
    const magnitude = Math.max(Math.abs(reportedNet), 1);
    const pctDiff = diff / magnitude;

    if (pctDiff < 0.001) {
      reconScore = 1.0;
      findings.push('Cash flow reconciled perfectly');
    } else if (pctDiff < 0.01) {
      reconScore = 0.85;
      findings.push(`Cash flow reconciled within 1% (difference: ${diff.toFixed(0)})`);
    } else if (pctDiff < 0.05) {
      reconScore = 0.6;
      findings.push(`Cash flow reconciliation off by ${(pctDiff * 100).toFixed(1)}%`);
    } else {
      reconScore = 0.3;
      findings.push(`Cash flow does NOT reconcile (expected: ${reportedNet}, computed: ${computedNet.toFixed(0)})`);
    }
  } else {
    findings.push('Net change in cash not reported — cannot verify reconciliation');
    reconScore = 0.4;
  }

  // Section subtotal consistency
  let subtotalScore = 1.0;
  for (const [name, section] of Object.entries(sections)) {
    if (!section.items || section.items.length === 0) continue;
    const itemSum = section.items.reduce((sum, item) => sum + (item.convertedValue || 0), 0);
    const reported = section.subtotal || 0;
    const diff = Math.abs(itemSum - reported);
    const magnitude = Math.max(Math.abs(reported), 1);
    if (diff / magnitude > 0.01) {
      subtotalScore -= 0.25;
      findings.push(`${name} subtotal mismatch: items sum to ${itemSum.toFixed(0)}, reported ${reported}`);
    }
  }
  subtotalScore = Math.max(0, subtotalScore);
  if (subtotalScore === 1.0) {
    findings.push('All section subtotals consistent with line items');
  }

  // Non-empty sections check
  const populatedSections = Object.values(sections).filter(
    s => s.items && s.items.length > 0
  ).length;
  let sectionScore;
  if (populatedSections === 3) sectionScore = 1.0;
  else if (populatedSections === 2) sectionScore = 0.7;
  else sectionScore = 0.4;
  findings.push(`${populatedSections}/3 sections populated`);

  // Magnitude reasonableness (check original vs converted)
  let magnitudeScore = 1.0;
  const allItems = [
    ...(sections.operating?.items || []),
    ...(sections.investing?.items || []),
    ...(sections.financing?.items || []),
  ];
  for (const item of allItems) {
    if (item.originalValue && item.convertedValue) {
      const orig = Math.abs(item.originalValue);
      const conv = Math.abs(item.convertedValue);
      if (orig > 0 && conv > 0) {
        const ratio = conv / orig;
        if (ratio > 10 || ratio < 0.1) {
          magnitudeScore -= 0.15;
          findings.push(`Magnitude concern: "${item.label}" changed from ${item.originalValue} to ${item.convertedValue}`);
        }
      }
    }
  }
  magnitudeScore = Math.max(0, magnitudeScore);

  const score =
    0.40 * reconScore +
    0.30 * subtotalScore +
    0.15 * sectionScore +
    0.15 * magnitudeScore;

  return { score: Math.max(0, Math.min(1, score)), findings };
}

module.exports = { calculate };
