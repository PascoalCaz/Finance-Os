import os
import sys
import requests
import time

# Adicionar o diretório do projeto ao sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from finance.services import NocoDBClient

def main():
    c = NocoDBClient()
    url = f"{c.base_url}/api/v3/data/{c.base_id}/{c.table_financeiro}/records"
    
    print("🚀 Iniciando limpeza recursiva em blocos pequenos...")
    
    deleted_total = 0
    while True:
        # 1. Buscar um pequeno lote
        try:
            data = c.get_transactions()
            transactions = data.get('list', [])
            if not transactions:
                break
                
            # Pegar apenas os primeiros 5 para segurança máxima contra 422
            chunk = transactions[:5]
            ids_payload = [{"id": t.get('Id')} for t in chunk]
            
            print(f"🧹 Deletando lote de {len(chunk)} registros (Total removido: {deleted_total})...", end="\r")
            
            res = requests.delete(url, headers=c.headers, json=ids_payload)
            if res.status_code == 200:
                deleted_total += len(chunk)
            else:
                print(f"\n❌ Erro no lote: {res.status_code} - {res.text}")
                # Se falhar o lote, tentar um a um para não travar
                for t in chunk:
                    try:
                        c.delete_transaction(t.get('Id'))
                        deleted_total += 1
                    except:
                        pass
            
            time.sleep(0.5) # Pausa curta para evitar rate limit ou stress no server
            
        except Exception as e:
            print(f"\n🛑 Erro fatal no loop: {e}")
            break
            
    print(f"\n✨ Limpeza concluída com sucesso! Total: {deleted_total} transações removidas.")

if __name__ == "__main__":
    main()
