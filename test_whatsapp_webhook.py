import requests
import json

def test_webhook():
    url = "http://127.0.0.1:8000/api/whatsapp/webhook/"
    
    # Simulação de Payload da Evolution API (messages.upsert)
    payload = {
        "event": "messages.upsert",
        "instance": "2056DF867760-49C1-9188-B9AE8498D4CF",
        "data": {
            "key": {
                "remoteJid": "244923000000@s.whatsapp.net",
                "fromMe": False,
                "id": "ABC123XYZ"
            },
            "message": {
                "conversation": "Gastei 5000 no restaurante hoje"
            },
            "messageType": "conversation"
        }
    }
    
    print(f"Enviando payload para {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.json()}")
    except Exception as e:
        print(f"Erro no teste: {e}")

if __name__ == "__main__":
    test_webhook()
