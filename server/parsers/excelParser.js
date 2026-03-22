const XLSX = require('xlsx');

function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const sheetName =
    workbook.SheetNames.find(n => /cash.?flow/i.test(n)) ||
    workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const textLines = jsonData
    .filter(row => row.some(cell => cell !== ''))
    .map(row => row.join('\t'));

  return {
    text: textLines.join('\n'),
    rowCount: textLines.length,
    sheetName,
  };
}

function getInputType() {
  return 'excel';
}

module.exports = { parseExcel, getInputType };
