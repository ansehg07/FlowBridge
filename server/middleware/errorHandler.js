function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err.message && err.message.includes('Unsupported file type')) {
    return res.status(415).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error. Please try again.' });
}

const multer = require('multer');

module.exports = { errorHandler };
