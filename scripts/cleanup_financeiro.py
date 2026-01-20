import os
import sys
import django

# Adicionar o diretório do projeto ao sys.path para importar o cliente
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importar o cliente do NocoDB
from finance.services import NocoDBClient

def main():
    print("🚀 Iniciando limpeza total da tabela Financeiro...")
    client = NocoDBClient()
    
    # 1. Buscar todas as transações
    print("📂 Procurando transações...")
    data = client.get_transactions()
    transactions = data.get('list', [])
    
    if not transactions:
        print("✅ A tabela já está vazia.")
        return

    print(f"⚠️ Encontradas {len(transactions)} transações para deletar.")
    
    # 2. Deletar em blocos (v3 bulk delete é muito mais rápido)
    import requests
    url = f"{client.base_url}/api/v3/data/{client.base_id}/{client.table_financeiro}/records"
    
    chunk_size = 50
    total_deleted = 0
    
    for i in range(0, len(transactions), chunk_size):
        chunk = transactions[i:i + chunk_size]
        ids_payload = [{"id": t.get('Id')} for t in chunk]
        
        print(f"🧹 Deletando bloco {i//chunk_size + 1}... ({len(chunk)} registros)")
        try:
            response = requests.delete(url, headers=client.headers, json=ids_payload)
            response.raise_for_status()
            total_deleted += len(chunk)
        except Exception as e:
            print(f"❌ Erro no bloco {i//chunk_size + 1}: {e}")
            # Tentar deletar um a um se o bloco falhar
            for t in chunk:
                try:
                    client.delete_transaction(t.get('Id'))
                    total_deleted += 1
                except:
                    pass
            
    print(f"\n✨ Limpeza concluída! {total_deleted} transações removidas.")

if __name__ == "__main__":
    main()
