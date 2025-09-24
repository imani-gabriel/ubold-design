import pandas as pd
import json

# Lire le fichier Excel
excel_file = './store/docs/cholera-db.xlsx'
df = pd.read_excel(excel_file)

# Convertir en JSON
json_data = df.to_json(orient='records', indent=2)

# Écrire le résultat dans un fichier JSON
output_file = './store/docs/cholera-db.json'
with open(output_file, 'w') as f:
    f.write(json_data)

print(f"Conversion terminée. Le fichier JSON a été créé à {output_file}")
