import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { PDFConverter } from '../scripts_python/pdf-converter';
import { XMLExtractorBuilder } from '../scripts_python/xml_extractor/xml-extractor-builder';
import type { PythonInterpreter } from './python-interpreter';

export class DocumentProcessorService {
  private xmlJavaBin: string;
  private interpreter: PythonInterpreter;

  constructor(interpreter: PythonInterpreter, resourcesPath: string) {
    this.interpreter = interpreter;
    this.xmlJavaBin = path.join(resourcesPath, 'bin', 'xmljava.exe');
  }

  /**
   * Genera un archivo XML a partir de un documento (pdf, xls, xlsx, doc, docx).
   * @param filePath Ruta del documento original.
   * @returns La ruta al archivo XML generado.
   */
  public async generateXml(filePath: string): Promise<string> {
    let targetFile = filePath;
    const ext = path.extname(filePath).toLowerCase();

    // 1. Validar y Convertir si es PDF
    if (ext === '.pdf') {
      const pdfConverter = new PDFConverter(this.interpreter);
      targetFile = await pdfConverter.convertToDocx(filePath);
    } else if (!['.xls', '.xlsx', '.doc', '.docx'].includes(ext)) {
      throw new Error(`La extensión de archivo '${ext}' no está soportada para la extracción.`);
    }

    // 2. Ejecutar xmljava.exe para generar el XML
    await this.runXmlJava(targetFile);

    // xmljava.exe genera el .xml en la misma ruta con el mismo nombre base
    const parsedPath = path.parse(targetFile);
    const xmlPath = path.join(parsedPath.dir, `${parsedPath.name}.xml`);

    if (!fs.existsSync(xmlPath)) {
      throw new Error(`El ejecutable no generó el archivo XML esperado en: ${xmlPath}`);
    }

    return xmlPath;
  }

  /**
   * Procesa un documento (pdf, xls, xlsx, doc, docx).
   * Si es PDF lo convierte a DOCX.
   * Luego ejecuta xmljava.exe para generar el XML.
   * Finalmente, usa el XMLExtractor para recuperar los textos planos.
   *
   * @param filePath Ruta absoluta del documento original.
   * @returns Un arreglo unidimensional con los textos extraídos.
   */
  public async processDocument(filePath: string): Promise<string[]> {
    const xmlPath = await this.generateXml(filePath);

    // 3. Ejecutar el scraper de Python que creamos previamente
    const extractor = new XMLExtractorBuilder()
      .setInterpreter(this.interpreter)
      .setXmlPath(xmlPath)
      .build();

    const flatData = await extractor.extractTables();
    return flatData;
  }

  /**
   * Ejecuta el binario xmljava.exe pasándole la ruta del documento.
   */
  private runXmlJava(docPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      execFile(this.xmlJavaBin, [docPath], (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Error ejecutando xmljava.exe en el documento '${docPath}': ${error.message}\nStderr: ${stderr}`));
          return;
        }
        resolve();
      });
    });
  }
}
