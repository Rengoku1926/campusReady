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
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = __importDefault(require("../middleware/auth"));
const user_1 = __importDefault(require("../models/user"));
const router = express_1.default.Router();
// Get current user
router.get('/me', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = yield user_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Update user profile
router.put('/profile', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (email !== req.user.email) {
            const existingUser = yield user_1.default.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        const updatedUser = yield user_1.default.updateProfile(req.user.id, { name, email });
        res.json(updatedUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Change password
router.put('/password', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = yield user_1.default.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        yield user_1.default.updatePassword(req.user.id, newPassword);
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;
