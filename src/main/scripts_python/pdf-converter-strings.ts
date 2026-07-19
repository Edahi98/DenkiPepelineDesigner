export const PDF_CONVERTER_IMPORTS = `
from pdf2docx import Converter
`;

export const getPdfConverterLogic = (pdfPath: string, wordPath: string): string => `
pdf_archivo = r'''${pdfPath}'''
word_archivo = r'''${wordPath}'''

cv = Converter(pdf_archivo)
cv.convert(word_archivo)
cv.close()
`;
