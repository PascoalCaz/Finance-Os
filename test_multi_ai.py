import os
import django
from dotenv import load_dotenv

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_project.settings')
django.setup()

from finance.services import AIClient, NocoDBClient

def test_provider(provider_name):
    print(f"\n--- Testando Provedor: {provider_name.upper()} ---")
    os.environ["AI_PROVIDER"] = provider_name
    client = AIClient()
    noco = NocoDBClient()
    
    try:
        categories = noco.get_categories()['list']
    except Exception as e:
        print(f"Erro ao buscar categorias: {e}")
        categories = [{"nome": "Alimentação", "Id": 1}, {"nome": "Transportes", "Id": 2}]

    # Teste 1: Transação Clara
    text_clear = "Gastei 50 euros em almoço no restaurante"
    print(f"Input: {text_clear}")
    res = client.parse_transaction(text_clear, categories)
    print(f"Resultado: {res}")

    # Teste 2: Pergunta (Dúvida)
    text_vague = "Registra um gasto de 100 hoje"
    print(f"\nInput Vago: {text_vague} (Deve gerar Pergunta)")
    res_vague = client.parse_transaction(text_vague, categories)
    print(f"Resultado: {res_vague}")

if __name__ == "__main__":
    load_dotenv()
    # Testar DeepSeek
    if os.getenv("DEEPSEEK_API_KEY"):
        test_provider("deepseek")
    else:
        print("\n[AVISO] DEEPSEEK_API_KEY não encontrada no .env. Pulando teste.")
        
    # Testar Ollama
    test_provider("ollama")
