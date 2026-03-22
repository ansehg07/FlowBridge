const pdfParse = require('pdf-parse');

async function parsePdf(buffer) {
  const data = await pdfParse(buffer);

  const lines = data.text.split('\n');
  const processed = lines
    .map(line => line.replace(/\s{3,}/g, '\t').trim())
    .filter(line => line.length > 0);

  return {
    text: processed.join('\n'),
    pageCount: data.numpages,
    metadata: data.info || {},
  };
}

function getInputType() {
  return 'pdf';
}

module.exports = { parsePdf, getInputType };
