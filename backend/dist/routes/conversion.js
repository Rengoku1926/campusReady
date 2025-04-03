"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = __importDefault(require("../middleware/auth"));
const conversion_1 = __importDefault(require("../models/conversion"));
const pdfToXmlService_1 = __importDefault(require("../services/pdfToXmlService"));
const router = express_1.default.Router();
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
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
router.get('/', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const conversions = yield conversion_1.default.findByUser((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        res.json(conversions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get single conversion
router.get('/:id', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const conversion = yield conversion_1.default.findById(req.params.id);
        if (!conversion) {
            res.status(404).json({ message: 'Conversion not found' });
            return;
        }
        if (conversion.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }
        res.json(conversion);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Upload and create new conversion
router.post('/', auth_1.default, upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const conversion = yield conversion_1.default.create({
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            originalFileName: req.file.originalname,
            filePath: req.file.path,
        });
        processPdfConversion(conversion.id, req.file.path);
        res.status(201).json(conversion);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Helper function to process PDF conversion asynchronously
function processPdfConversion(conversionId, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield conversion_1.default.updateStatus(conversionId, 'processing');
            const xmlContent = yield pdfToXmlService_1.default.convert(filePath);
            yield conversion_1.default.updateXmlContent(conversionId, xmlContent);
        }
        catch (error) {
            console.error('Conversion failed:', error);
            yield conversion_1.default.updateStatus(conversionId, 'failed');
        }
    });
}
exports.default = router;
