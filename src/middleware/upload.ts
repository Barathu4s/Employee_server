import multer from 'multer';

const storage = multer.memoryStorage();

const allowedImageMimes = new Set(["image/jpeg", "image/png"]);
const allowedDocMimes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function fileFilter(req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.fieldname === 'image') {
    if (!allowedImageMimes.has(file.mimetype)) {
      return cb(new Error('Invalid image type. Only jpg, jpeg, png are allowed'));
    }
    return cb(null, true);
  }
  if (file.fieldname === 'document') {
    if (!allowedDocMimes.has(file.mimetype)) {
      return cb(new Error('Invalid document type. Only PDF or Word files are allowed'));
    }
    return cb(null, true);
  }
  return cb(new Error('Unexpected field'));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 2,
    fileSize: 5 * 1024 * 1024,
  },
});

export function validateUploadConstraints(req: any, res: any, next: any) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (!files) return next();

  const imageFiles = files.image || [];
  const docFiles = files.document || [];

  if (imageFiles.length > 1) {
    return res.status(400).json({ error: 'Only one image is allowed' });
  }
  if (docFiles.length > 1) {
    return res.status(400).json({ error: 'Only one document is allowed' });
  }

  const image = imageFiles[0];
  const document = docFiles[0];

  if (image && image.size > 1 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image must be 1MB or smaller' });
  }
  if (document && document.size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'Document must be 5MB or smaller' });
  }

  return next();
}

