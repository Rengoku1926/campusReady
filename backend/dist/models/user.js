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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const UserModel = {
    create(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, password, name }) {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
            });
            return user;
        });
    },
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.user.findUnique({
                where: { email },
            });
        });
    },
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.user.findUnique({
                where: { id },
            });
        });
    },
    updateProfile(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { name, email }) {
            const updatedUser = yield prisma.user.update({
                where: { id },
                data: { name, email },
            });
            return updatedUser;
        });
    },
    updatePassword(id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            yield prisma.user.update({
                where: { id },
                data: { password: hashedPassword },
            });
            return true;
        });
    },
};
exports.default = UserModel;
