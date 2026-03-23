const multer = require('multer');
const path = require('path');

// Use memory storage — disk storage is not available on Vercel serverless
const storage = multer.memoryStorage();

// Check file type
function checkFileType(file, cb) {
  // Allow PDFs and Images
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: PDFs and Images Only!'));
  }
}

// Init upload
const clientUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = clientUpload;
