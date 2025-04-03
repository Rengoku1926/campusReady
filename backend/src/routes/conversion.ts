import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authMiddleware,{AuthRequest} from '../middleware/auth';
import Conversion from '../models/conversion';
import pdfToXmlService from '../services/pdfToXmlService';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Get all conversions for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const conversions = await Conversion.findByUser(req.user?.id as number);
    res.json(conversions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single conversion
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) : Promise<void> => {
  try {
    const conversion = await Conversion.findById(req.params.id);
    
    if (!conversion) {
      res.status(404).json({ message: 'Conversion not found' });
      return 
    }
    
    if (conversion.userId !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return 
    }
    
    res.json(conversion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload and create new conversion
router.post('/', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response) : Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return 
    }
    
    const conversion = await Conversion.create({
      userId: req.user?.id as number,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
    });
    
    processPdfConversion(conversion.id, req.file.path);
    
    res.status(201).json(conversion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to process PDF conversion asynchronously
async function processPdfConversion(conversionId: string, filePath: string) {
  try {
    await Conversion.updateStatus(conversionId, 'processing');
    
    const xmlContent = await pdfToXmlService.convert(filePath);
    
    await Conversion.updateXmlContent(conversionId, xmlContent);
  } catch (error) {
    console.error('Conversion failed:', error);
    await Conversion.updateStatus(conversionId, 'failed');
  }
}

export default router;