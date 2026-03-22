const { parse } = require('csv-parse/sync');

function parseCsv(buffer) {
  const csvText = buffer.toString('utf-8');

  let records;
  try {
    records = parse(csvText, {
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch {
    const lines = csvText.split('\n').filter(l => l.trim());
    records = lines.map(l => l.split(',').map(c => c.trim()));
  }

  const textLines = records
    .filter(row => row.some(cell => cell !== ''))
    .map(row => row.join('\t'));

  return {
    text: textLines.join('\n'),
    rowCount: textLines.length,
  };
}

function getInputType() {
  return 'csv';
}

module.exports = { parseCsv, getInputType };
