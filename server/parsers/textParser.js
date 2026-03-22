function normalize(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t+/g, '\t')
    .replace(/[ ]{3,}/g, '\t')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getInputType() {
  return 'text';
}

module.exports = { normalize, getInputType };
