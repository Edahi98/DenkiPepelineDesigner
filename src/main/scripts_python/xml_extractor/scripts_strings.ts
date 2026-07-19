export const XML_EXTRACTOR_IMPORTS = `
import sys
import json
import os
from bs4 import BeautifulSoup
`;

export const getXmlExtractorSetup = (xmlPath: string) => `
xml_path = r'''${xmlPath}'''

if not os.path.exists(xml_path):
    print(json.dumps({"error": f"XML file not found: {xml_path}"}))
    sys.exit(1)

with open(xml_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'xml')
`;

export const XML_EXTRACTOR_LOGIC = `
flat_data = []

for para_elem in soup.find_all("Paragraph"):
    text = para_elem.get_text(strip=True)
    if text:
        flat_data.append(text)

for table_elem in soup.find_all("Table"):
    for row_elem in table_elem.find_all("Row"):
        for col_elem in row_elem.find_all("Col"):
            text = col_elem.get_text(strip=True)
            if text:
                flat_data.append(text)
`;

export const XML_EXTRACTOR_OUTPUT = `
print(json.dumps(flat_data))
`;
