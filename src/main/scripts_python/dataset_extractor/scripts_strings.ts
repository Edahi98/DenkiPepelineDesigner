export const DATASET_EXTRACTOR_IMPORTS = `
import polars as pl
import json
import sys
`;

export const getDatasetExtractorSetup = (filePath: string): string => `
file_path = r'''${filePath}'''
`;

export const DATASET_EXTRACTOR_LOGIC = `
try:
    if file_path.lower().endswith('.csv'):
        columns = pl.scan_csv(file_path).collect_schema().names()
    elif file_path.lower().endswith('.parquet'):
        columns = pl.scan_parquet(file_path).collect_schema().names()
    else:
        print(json.dumps({"error": "Formato no soportado"}))
        sys.exit(1)
        
    print(json.dumps(columns))
`;

export const DATASET_PREVIEW_LOGIC = `
try:
    if file_path.lower().endswith('.csv'):
        df = pl.scan_csv(file_path).collect()
    elif file_path.lower().endswith('.parquet'):
        df = pl.scan_parquet(file_path).collect()
    else:
        print(json.dumps({"error": "Formato no soportado"}))
        sys.exit(1)
        
    result_dict = df.to_dict(as_series=False)
    print(json.dumps(result_dict, default=str))
`;

export const getDatasetColumnValuesSetup = (filePath: string, column: string): string => `
file_path = r'''${filePath}'''
column = r'''${column}'''
`;

export const DATASET_COLUMN_VALUES_LOGIC = `
try:
    if file_path.lower().endswith('.csv'):
        df = pl.scan_csv(file_path).select(column).collect()
    elif file_path.lower().endswith('.parquet'):
        df = pl.scan_parquet(file_path).select(column).collect()
    else:
        print(json.dumps({"error": "Formato no soportado"}))
        sys.exit(1)
    values = df[column].to_list()
    print(json.dumps(values, default=str))
`;

export const DATASET_EXTRACTOR_OUTPUT = `
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
`;
