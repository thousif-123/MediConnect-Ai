import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const PRESCRIPTION_DIR = path.resolve(process.cwd(), 'storage', 'prescriptions');
if (!fs.existsSync(PRESCRIPTION_DIR)) {
  fs.mkdirSync(PRESCRIPTION_DIR, { recursive: true });
}

// Storage engine keeping filenames unique and non-guessable
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PRESCRIPTION_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    cb(null, `rx_${uniqueSuffix}${ext}`);
  },
});

export const uploadPrescription = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMime = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, and PDF documents are allowed.'));
    }
  },
});
