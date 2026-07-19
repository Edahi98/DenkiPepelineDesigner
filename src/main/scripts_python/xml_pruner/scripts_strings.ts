export const XML_PRUNER_IMPORTS = `
import sys
import json
import os
import uuid
from bs4 import BeautifulSoup
`;

export const getXmlPrunerSetup = (xmlPath: string, validDataJson: string) => `
xml_path = r'''${xmlPath}'''
valid_data_json = r'''${validDataJson}'''

if not os.path.exists(xml_path):
    print(json.dumps({"error": f"XML file not found: {xml_path}"}))
    sys.exit(1)

with open(xml_path, 'r', encoding='utf-8') as f:
    xml_content = f.read()

try:
    soup = BeautifulSoup(xml_content, 'xml')
except:
    soup = BeautifulSoup(xml_content, 'html.parser')
`;

export const XML_PRUNER_LOGIC = `
try:
    raw_data = json.loads(valid_data_json)
    valid_set = set()
    
    def extract_values(obj):
        if isinstance(obj, dict):
            for v in obj.values():
                extract_values(v)
        elif isinstance(obj, list):
            for v in obj:
                extract_values(v)
        else:
            if obj is not None:
                valid_set.add(str(obj).replace('\\r', '').strip())
                
    extract_values(raw_data)
    
    def clean(s):
        return ''.join(str(s).split())
        
    valid_cleaned = {clean(v) for v in valid_set}

    # 1. Prune all nodes that have text but didn't pass
    for node in soup.find_all(): # Iterate over tags
        # Only check nodes that have text but NO child tags (leaf nodes with text)
        if not node.find_all():
            text = clean(node.get_text())
            if text and not any(text in v for v in valid_cleaned):
                node.decompose()

    # 2. Clean up all empty tags (recursively)
    changed = True
    while changed:
        changed = False
        for node in soup.find_all():
            if not node.find_all() and not clean(node.get_text()):
                if node.name != "Document": # Never delete root
                    node.decompose()
                    changed = True
            
    output_path = xml_path.replace('.xml', f'_pruned_{uuid.uuid4().hex[:6]}.xml')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())
        
    result_json = json.dumps({"success": True, "output_path": output_path})
    
except Exception as e:
    result_json = json.dumps({"error": str(e)})
`;

export const XML_PRUNER_OUTPUT = `
print(result_json)
`;
