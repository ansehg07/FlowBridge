const Tesseract = require('tesseract.js');

async function parseImage(buffer) {
  const worker = await Tesseract.createWorker('eng');

  const { data } = await worker.recognize(buffer);
  await worker.terminate();

  return {
    text: data.text,
    ocrConfidence: data.confidence,
  };
}

function getInputType() {
  return 'image';
}

module.exports = { parseImage, getInputType };
