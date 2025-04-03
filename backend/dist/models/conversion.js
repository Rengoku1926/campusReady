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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
const Conversion = {
    create(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, originalFileName, filePath, }) {
            return yield prisma.conversion.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    userId,
                    originalFileName,
                    filePath,
                    status: 'pending', // ✅ Use lowercase string instead of Status.PENDING
                },
            });
        });
    },
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.conversion.findUnique({
                where: { id },
            });
        });
    },
    findByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.conversion.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
        });
    },
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.conversion.update({
                where: { id },
                data: {
                    status, // ✅ `status` is already of type Status, no need to use Status.PENDING
                    updatedAt: new Date(),
                },
            });
        });
    },
    updateXmlContent(id, xmlContent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.conversion.update({
                where: { id },
                data: {
                    xmlContent,
                    status: 'completed', // ✅ Use lowercase string instead of Status.COMPLETED
                    updatedAt: new Date(),
                },
            });
        });
    },
};
exports.default = Conversion;
