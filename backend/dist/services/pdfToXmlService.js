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
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const fs_1 = require("fs");
const xmldom_1 = require("xmldom");
class PdfToXmlService {
    /**
     * Convert PDF file to XML
     * @param filePath Path to the PDF file
     * @returns XML content as a Promise<string>
     */
    convert(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dataBuffer = yield fs_1.promises.readFile(filePath);
                const data = yield (0, pdf_parse_1.default)(dataBuffer);
                return this._level2Conversion(data);
            }
            catch (error) {
                console.error('Error converting PDF to XML:', error);
                throw new Error('Failed to convert PDF to XML');
            }
        });
    }
    /**
     * Level 2 Conversion - Improved structure detection
     * @param pdfData Data from pdf-parse
     * @returns XML content
     */
    _level2Conversion(pdfData) {
        var _a, _b, _c;
        const doc = new xmldom_1.DOMParser().parseFromString('<document></document>', 'text/xml');
        const documentEl = doc.documentElement;
        const metadataEl = doc.createElement('metadata');
        metadataEl.appendChild(this._createElement(doc, 'title', ((_a = pdfData.info) === null || _a === void 0 ? void 0 : _a.Title) || 'Untitled Document'));
        metadataEl.appendChild(this._createElement(doc, 'author', ((_b = pdfData.info) === null || _b === void 0 ? void 0 : _b.Author) || 'Unknown Author'));
        metadataEl.appendChild(this._createElement(doc, 'creationDate', ((_c = pdfData.info) === null || _c === void 0 ? void 0 : _c.CreationDate) || ''));
        metadataEl.appendChild(this._createElement(doc, 'pageCount', String(pdfData.numpages)));
        documentEl.appendChild(metadataEl);
        const contentEl = doc.createElement('content');
        const pages = this._splitIntoPages(pdfData.text, pdfData.numpages);
        pages.forEach((pageText, pageIndex) => {
            const pageEl = doc.createElement('page');
            pageEl.setAttribute('number', String(pageIndex + 1));
            const sections = this._identifySections(pageText);
            sections.forEach(section => {
                if (section.type === 'header') {
                    const headerEl = this._createElement(doc, 'header', section.text || '');
                    headerEl.setAttribute('level', String(section.level || 1));
                    pageEl.appendChild(headerEl);
                }
                else if (section.type === 'paragraph') {
                    pageEl.appendChild(this._createElement(doc, 'paragraph', section.text || ''));
                }
                else if (section.type === 'list' && section.items) {
                    const listEl = doc.createElement('list');
                    section.items.forEach(item => listEl.appendChild(this._createElement(doc, 'item', item)));
                    pageEl.appendChild(listEl);
                }
            });
            contentEl.appendChild(pageEl);
        });
        documentEl.appendChild(contentEl);
        return new xmldom_1.XMLSerializer().serializeToString(doc);
    }
    _splitIntoPages(text, numPages) {
        const lines = text.split('\n').filter(line => line.trim());
        const linesPerPage = Math.ceil(lines.length / numPages);
        return Array.from({ length: numPages }, (_, i) => lines.slice(i * linesPerPage, (i + 1) * linesPerPage).join('\n'));
    }
    _identifySections(text) {
        const sections = [];
        const lines = text.split('\n').filter(line => line.trim());
        let currentParagraph = '';
        let listItems = [];
        let inList = false;
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (/^[A-Z\s]{3,100}$/.test(trimmedLine)) {
                if (currentParagraph) {
                    sections.push({ type: 'paragraph', text: currentParagraph.trim() });
                    currentParagraph = '';
                }
                if (inList) {
                    sections.push({ type: 'list', items: listItems });
                    listItems = [];
                    inList = false;
                }
                sections.push({ type: 'header', level: 1, text: trimmedLine });
            }
            else if (/^[\s]*[-•*⋅◦‣⁃○●\d+\.]/.test(trimmedLine)) {
                if (currentParagraph) {
                    sections.push({ type: 'paragraph', text: currentParagraph.trim() });
                    currentParagraph = '';
                }
                inList = true;
                listItems.push(trimmedLine.replace(/^[-•*⋅◦‣⁃○●\d+\.]+\s*/, ''));
            }
            else {
                if (inList) {
                    sections.push({ type: 'list', items: listItems });
                    listItems = [];
                    inList = false;
                }
                currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
            }
        });
        if (currentParagraph)
            sections.push({ type: 'paragraph', text: currentParagraph.trim() });
        if (inList)
            sections.push({ type: 'list', items: listItems });
        return sections;
    }
    _createElement(doc, tagName, text) {
        const el = doc.createElement(tagName);
        el.textContent = text;
        return el;
    }
}
exports.default = new PdfToXmlService();
