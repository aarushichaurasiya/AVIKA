const express = require('express');
const { upload } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');

const router = express.Router();

router.post('/', protect, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return next(ApiError.badRequest(err.message));
    if (!req.file) return next(ApiError.badRequest('No file uploaded'));
    // Served statically from /uploads (see app.js). Swap this for an S3/Cloudinary
    // URL in production — local disk storage doesn't survive a redeploy.
    const url = `/uploads/${req.file.filename}`;
    sendSuccess(res, 201, { url });
  });
});

module.exports = router;
