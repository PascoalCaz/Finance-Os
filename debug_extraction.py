import os
import django
from dotenv import load_dotenv
import io

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_project.settings')
django.setup()

from finance.services import AIClient, DocumentService, NocoDBClient

def debug_file(file_path):
    print(f"\n=== DEBUGGING: {file_path} ===")
    
    with open(file_path, 'rb') as f:
        class MockFile:
            def __init__(self, file_obj, name):
                self.file = file_obj
                self.name = name
            def read(self, *args, **kwargs): return self.file.read(*args, **kwargs)
            def seek(self, *args, **kwargs): return self.file.seek(*args, **kwargs)
            def tell(self, *args, **kwargs): return self.file.tell(*args, **kwargs)
            def close(self): return self.file.close()
            def __enter__(self): return self
            def __exit__(self, exc_type, exc_val, exc_tb): return self.file.__exit__(exc_type, exc_val, exc_tb)

        mock_file = MockFile(f, os.path.basename(file_path))
        extracted_text = DocumentService.extract_text(mock_file)
    
    print("\n--- TEXTO EXTRAÍDO ---")
    print(extracted_text)
    
    if not extracted_text:
        print("ERRO: Nenhum texto extraído!")
        return

    noco = NocoDBClient()
    try:
        categories = noco.get_categories()['list']
    except:
        categories = [{"nome": "Energia", "Id": 1}, {"nome": "Alimentação", "Id": 2}]
        
    ai = AIClient()
    
    print("\n--- DEEPSEEK RESULT ---")
    print(ai.parse_transaction(extracted_text, categories, provider="deepseek"))

    print("\n--- OLLAMA RESULT ---")
    print(ai.parse_transaction(extracted_text, categories, provider="ollama"))

if __name__ == "__main__":
    load_dotenv()
    f = r"c:\Users\Newgen\Documents\finance\docs\WhatsApp Image 2026-01-01 at 17.03.20.p.jpeg"
    debug_file(f)
