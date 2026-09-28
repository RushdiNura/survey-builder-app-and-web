// POST /api/uploads  (multipart/form-data, field name "file")
// Used by: image-question assets (survey owner) and file-upload answers (respondents).
// Public by design — respondents filling an anonymous survey aren't logged in —
// but locked down via multer's file-type/size limits (see middleware/upload.js).
exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({
    url,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
};
