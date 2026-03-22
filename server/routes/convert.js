const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const textParser = require('../parsers/textParser');
const pdfParser = require('../parsers/pdfParser');
const excelParser = require('../parsers/excelParser');
const csvParser = require('../parsers/csvParser');
const imageParser = require('../parsers/imageParser');

const { buildPrompt } = require('../converters/promptBuilder');
const { callGemini } = require('../converters/geminiClient');
const { parseGeminiResponse, validateResponse } = require('../converters/responseParser');
const { calculateConfidence } = require('../confidence/engine');

router.post('/convert', upload.single('file'), async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { inputType, direction, currency, text } = req.body;

    if (!direction || !['ifrs-to-gaap', 'gaap-to-ifrs'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid direction. Use "ifrs-to-gaap" or "gaap-to-ifrs".' });
    }

    const curr = currency || 'USD';
    let extractedText = '';
    let parseInputType = inputType || 'text';
    let ocrConfidence = null;

    switch (parseInputType) {
      case 'text':
        extractedText = textParser.normalize(text || '');
        break;

      case 'pdf':
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const pdfResult = await pdfParser.parsePdf(req.file.buffer);
        extractedText = pdfResult.text;
        break;

      case 'excel':
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const excelResult = excelParser.parseExcel(req.file.buffer);
        extractedText = excelResult.text;
        break;

      case 'csv':
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const csvResult = csvParser.parseCsv(req.file.buffer);
        extractedText = csvResult.text;
        break;

      case 'image':
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const imageResult = await imageParser.parseImage(req.file.buffer);
        extractedText = imageResult.text;
        ocrConfidence = imageResult.ocrConfidence;
        break;

      default:
        return res.status(400).json({ error: `Unsupported input type: ${parseInputType}` });
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({ error: 'Could not extract sufficient text from input. Please try a different format.' });
    }

    // Build prompt and call Gemini
    const { systemPrompt, userPrompt } = buildPrompt(extractedText, direction, curr);
    console.log('Calling Gemini API...');
    const rawResponse = await callGemini(systemPrompt, userPrompt);
    console.log('Gemini response length:', rawResponse.length);
    console.log('Gemini response preview:', rawResponse.substring(0, 300));

    // Parse response
    const parsed = parseGeminiResponse(rawResponse);
    if (!parsed.success) {
      console.error('Failed to parse:', rawResponse.substring(0, 1000));
      return res.status(502).json({
        error: 'Failed to parse AI response',
        rawResponse: rawResponse.substring(0, 500),
      });
    }

    const validation = validateResponse(parsed.data);

    // Calculate confidence
    const confidence = calculateConfidence(extractedText, parsed.data, parseInputType, ocrConfidence);

    const processingTime = Date.now() - startTime;

    res.json({
      conversion: parsed.data,
      confidence,
      validation,
      rawExtractedText: extractedText,
      processingTime,
    });
  } catch (error) {
    console.error('Conversion error:', error);
    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid or missing Gemini API key.' });
    }
    next(error);
  }
});

router.post('/parse', upload.single('file'), async (req, res, next) => {
  try {
    const { inputType } = req.body;
    let extractedText = '';
    let ocrConfidence = null;

    switch (inputType) {
      case 'pdf':
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        extractedText = (await pdfParser.parsePdf(req.file.buffer)).text;
        break;
      case 'excel':
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        extractedText = excelParser.parseExcel(req.file.buffer).text;
        break;
      case 'csv':
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        extractedText = csvParser.parseCsv(req.file.buffer).text;
        break;
      case 'image':
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const result = await imageParser.parseImage(req.file.buffer);
        extractedText = result.text;
        ocrConfidence = result.ocrConfidence;
        break;
      default:
        return res.status(400).json({ error: 'Unsupported input type' });
    }

    res.json({ text: extractedText, ocrConfidence });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
