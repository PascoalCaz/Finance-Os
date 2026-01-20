import os
import sys
import requests

# Adicionar o diretório do projeto ao sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from finance.services import NocoDBClient

def main():
    c = NocoDBClient()
    print(f"Base ID: {c.base_id}")
    print(f"Table ID: {c.table_financeiro}")
    
    # 1. Obter registros
    data = c.get_transactions()
    transactions = data.get('list', [])
    print(f"Registros encontrados: {len(transactions)}")
    
    # 2. Deletar um por um com log detalhado
    for t in transactions:
        t_id = t.get('Id')
        url = f"{c.base_url}/api/v3/data/{c.base_id}/{c.table_financeiro}/records/{t_id}"
        print(f"➤ Deletando {t_id} ({t.get('Descricao')})... ", end="")
        res = requests.delete(url, headers=c.headers)
        print(f"Status: {res.status_code}")
        if res.status_code != 200:
            print(f"   Erro: {res.text}")

if __name__ == "__main__":
    main()
