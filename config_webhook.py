import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("EVOLUTION_API_URL")
API_KEY = os.getenv("EVOLUTION_API_KEY")
INSTANCE = os.getenv("EVOLUTION_INSTANCE")
WEBHOOK_URL = "http://77.37.41.138:8000/api/whatsapp/webhook/"

# Endpoint para configurar webhook (Evolution API v2 padrao)
# Geralmente: /webhook/set/{instance}
url = f"{API_URL}/webhook/set/{INSTANCE}"

payload = {
    "enabled": True,
    "url": WEBHOOK_URL,
    "webhookByEvents": False, # Envia tudo num so endpoint
    "events": [
        "MESSAGES_UPSERT"
    ]
}

headers = {
    "apikey": API_KEY,
    "Content-Type": "application/json"
}

print(f"Configurando Webhook para: {WEBHOOK_URL}")
print(f"Instancia: {INSTANCE}")
print(f"URL API: {url}")

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Erro: {e}")
