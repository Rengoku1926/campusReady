import pdf from 'pdf-parse';
import { promises as fs } from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';

interface PdfMetadata {
  Title?: string;
  Author?: string;
  CreationDate?: string;
}

interface PdfData {
  text: string;
  numpages: number;
  info?: PdfMetadata;
}

interface Section {
  type: 'header' | 'paragraph' | 'list';
  text?: string;
  level?: number;
  items?: string[];
}

class PdfToXmlService {
  /**
   * Convert PDF file to XML
   * @param filePath Path to the PDF file
   * @returns XML content as a Promise<string>
   */
  async convert(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data: PdfData = await pdf(dataBuffer);
      return this._level2Conversion(data);
    } catch (error) {
      console.error('Error converting PDF to XML:', error);
      throw new Error('Failed to convert PDF to XML');
    }
  }

  /**
   * Level 2 Conversion - Improved structure detection
   * @param pdfData Data from pdf-parse
   * @returns XML content
   */
  private _level2Conversion(pdfData: PdfData): string {
    const doc = new DOMParser().parseFromString('<document></document>', 'text/xml');
    const documentEl = doc.documentElement;

    const metadataEl = doc.createElement('metadata');
    metadataEl.appendChild(this._createElement(doc, 'title', pdfData.info?.Title || 'Untitled Document'));
    metadataEl.appendChild(this._createElement(doc, 'author', pdfData.info?.Author || 'Unknown Author'));
    metadataEl.appendChild(this._createElement(doc, 'creationDate', pdfData.info?.CreationDate || ''));
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
        } else if (section.type === 'paragraph') {
          pageEl.appendChild(this._createElement(doc, 'paragraph', section.text || ''));
        } else if (section.type === 'list' && section.items) {
          const listEl = doc.createElement('list');
          section.items.forEach(item => listEl.appendChild(this._createElement(doc, 'item', item)));
          pageEl.appendChild(listEl);
        }
      });

      contentEl.appendChild(pageEl);
    });
    documentEl.appendChild(contentEl);

    return new XMLSerializer().serializeToString(doc);
  }

  private _splitIntoPages(text: string, numPages: number): string[] {
    const lines = text.split('\n').filter(line => line.trim());
    const linesPerPage = Math.ceil(lines.length / numPages);
    return Array.from({ length: numPages }, (_, i) => 
      lines.slice(i * linesPerPage, (i + 1) * linesPerPage).join('\n')
    );
  }

  private _identifySections(text: string): Section[] {
    const sections: Section[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    let currentParagraph = '';
    let listItems: string[] = [];
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
      } else if (/^[\s]*[-•*⋅◦‣⁃○●\d+\.]/.test(trimmedLine)) {
        if (currentParagraph) {
          sections.push({ type: 'paragraph', text: currentParagraph.trim() });
          currentParagraph = '';
        }
        inList = true;
        listItems.push(trimmedLine.replace(/^[-•*⋅◦‣⁃○●\d+\.]+\s*/, ''));
      } else {
        if (inList) {
          sections.push({ type: 'list', items: listItems });
          listItems = [];
          inList = false;
        }
        currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
      }
    });

    if (currentParagraph) sections.push({ type: 'paragraph', text: currentParagraph.trim() });
    if (inList) sections.push({ type: 'list', items: listItems });

    return sections;
  }

  private _createElement(doc: Document, tagName: string, text: string): Element {
    const el = doc.createElement(tagName);
    el.textContent = text;
    return el;
  }
}

export default new PdfToXmlService();
