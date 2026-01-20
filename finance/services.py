import requests
import os
import io
from dotenv import load_dotenv

# Dependências para OCR e PDF
try:
    import pdfplumber
    import pytesseract
    from PIL import Image
except ImportError:
    pdfplumber = None
    pytesseract = None
    Image = None

# Configuração do Tesseract (Ajuste para o caminho padrão no Windows)
if pytesseract:
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
else:
    print("Aviso: Pytesseract não encontrado. OCR de imagem desativado.")

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

class NocoDBClient:
    """
    Cliente para integração com a API do NocoDB.
    Gere Transações e Categorias.
    """
    def __init__(self):
        # Configurações extraídas do ambiente
        self.base_url = os.getenv("NOCODB_BASE_URL")
        self.token = os.getenv("NOCODB_TOKEN")
        self.table_financeiro = os.getenv("TABLE_ID_FINANCEIRO")
        self.table_categoria = os.getenv("TABLE_ID_CATEGORIA")
        self.headers = {
            "xc-token": self.token,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def _get(self, table_id, params=None):
        """Método genérico para requisições GET com limite aumentado."""
        url = f"{self.base_url}/api/v2/tables/{table_id}/records"
        
        # Garantir limite de 1000 (máximo do NocoDB) por padrão
        params = params or {}
        if 'limit' not in params:
            params['limit'] = 1000
            
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()

    def _post(self, table_id, data):
        """Método genérico para requisições POST."""
        url = f"{self.base_url}/api/v2/tables/{table_id}/records"
        response = requests.post(url, headers=self.headers, json=data)
        response.raise_for_status()
        return response.json()

    def _patch(self, table_id, data):
        """Método genérico para requisições PATCH."""
        url = f"{self.base_url}/api/v2/tables/{table_id}/records"
        response = requests.patch(url, headers=self.headers, json=data)
        response.raise_for_status()
        return response.json()

    def _delete(self, table_id, record_id):
        """Método genérico para requisições DELETE."""
        url = f"{self.base_url}/api/v2/tables/{table_id}/records"
        response = requests.delete(url, headers=self.headers, json={"Id": record_id})
        response.raise_for_status()
        return response.status_code

    # --- Métodos para Transações (Financeiro) ---
    def get_transactions(self, query_params=None):
        return self._get(self.table_financeiro, params=query_params)

    def create_transaction(self, data):
        return self._post(self.table_financeiro, data)

    def update_transaction(self, data):
        return self._patch(self.table_financeiro, data)

    def delete_transaction(self, record_id):
        return self._delete(self.table_financeiro, record_id)

    # --- Métodos para Categorias ---
    def get_categories(self, query_params=None):
        return self._get(self.table_categoria, params=query_params)

    def create_category(self, data):
        return self._post(self.table_categoria, data)

    def update_category(self, data):
        return self._patch(self.table_categoria, data)

    def delete_category(self, record_id):
        return self._delete(self.table_categoria, record_id)

class AIClient:
    """
    Cliente para integração com LLMs (Ollama ou DeepSeek).
    Utilizado para processar linguagem natural e extrair dados financeiros.
    """
    def __init__(self):
        # Carrega a configuração do provedor
        self.provider = os.getenv("AI_PROVIDER", "ollama").lower()
        
        # Configurações Ollama
        self.ollama_url = "https://eden-ollama.w2zld5.easypanel.host/v1"
        self.ollama_model = "qwen2.5-coder:3b-instruct-q4_K_M"
        
        # Configurações DeepSeek (OpenAI-compatible)
        self.deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        self.deepseek_model = "deepseek-chat"
        self.deepseek_url = "https://api.deepseek.com"

    def _call_ollama(self, prompt):
        """Chamada específica para o Ollama."""
        try:
            response = requests.post(
                f"{self.ollama_url}/chat/completions",
                json={
                    "model": self.ollama_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0
                },
                timeout=60
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except Exception as e:
            print(f"Erro no Ollama: {e}")
            return None

    def _call_deepseek(self, prompt):
        """Chamada específica para o DeepSeek via biblioteca OpenAI."""
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.deepseek_key, base_url=self.deepseek_url)
            
            response = client.chat.completions.create(
                model=self.deepseek_model,
                messages=[
                    {"role": "system", "content": "Você é um assistente financeiro útil."},
                    {"role": "user", "content": prompt},
                ],
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Erro no DeepSeek: {e}")
            return None

    def parse_transaction(self, text, categories, provider=None):
        """
        Recebe um texto e tenta converter num objeto de transação JSON.
        """
        selected_provider = provider or self.provider
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        month_name = datetime.now().strftime("%B")
        
        cat_list = ", ".join([c['nome'] for c in categories])
        prompt = f"""Você é um assistente financeiro de elite, capaz de extrair dados de documentos e conversar com o usuário.
Sua missão é extrair dados para uma transação JÁ CONFIRMADA ou FAZER PERGUNTAS DE CLARIFICAÇÃO.

ENTRADA DO USUÁRIO: "{text}"
CATEGORIAS DISPONÍVEIS: {cat_list}
DATA ATUAL: {today}

CRITÉRIOS DE DECISÃO:
1. STATUS "Success": Se você tiver Valor, Tipo (Receita/Despesa) e uma Categoria clara (ou aproximada).
2. STATUS "Question": Se faltar o Valor Total ou se o Tipo/Categoria for impossível de determinar sem perguntar.

INSTRUÇÕES DE EXTRAÇÃO:
- Valor: Procure pelo valor TOTAL (Total a Pagar, Importe, etc). Se encontrar 'Kz', 'AOA', '€' ou '$', o número ao lado é o valor. Remova formatação (pontos/vírgulas) se necessário.
- Entidade: Identifique quem recebeu ou pagou (ex: ENDE, Restaurante, etc).
- Descrição: Profissional, ex: "Pagamento de Factura ENDE - Ref JAN/2026".

Retorne APENAS o JSON no formato:

Se for SUCESSO:
{{
    "Status": "success",
    "Data": "YYYY-MM-DD",
    "Tipo": "Receita" ou "Despesa",
    "Valor": 0.0,
    "Descricao": "descrição concisa",
    "Categoria_nome": "categoria da lista"
}}

Se for DÚVIDA/FALTA DE DADOS:
{{
    "Status": "question",
    "Message": "Uma pergunta educada e curta para o usuário solicitando o dado que falta (ex: 'Não consegui encontrar o valor total na imagem, pode dizer-me quanto foi?')"
}}"""
        
        
        try:
            # Seleciona o provedor e faz a chamada
            if selected_provider == "deepseek":
                content = self._call_deepseek(prompt)
            else:
                content = self._call_ollama(prompt)

            if not content:
                return None
            
            # Extração de JSON do conteúdo via Regex
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                import json
                raw_data = json.loads(json_match.group(0))
                
                # Normalizar chaves para serem case-insensitive
                parsed = {k.lower(): v for k, v in raw_data.items()}
                
                # Mapeamento Automático de Categoria_id
                cat_name = parsed.get("categoria_nome")
                cat_id = None
                for c in categories:
                    if str(c['nome']).lower() == str(cat_name).lower():
                        cat_id = c['Id']
                        break
                
                # Limpeza e Conversão de Valor (Robusto)
                raw_valor = parsed.get("valor", 0.0)
                try:
                    if isinstance(raw_valor, str):
                        # Remove símbolos de moeda, espaços e ajusta separadores decimais (PT/BR -> US)
                        clean_valor = raw_valor.replace('Kz', '').replace('€', '').replace('$', '').strip()
                        # Se houver pontos e vírgulas, assume-se formato europeu (1.234,56)
                        if ',' in clean_valor and '.' in clean_valor:
                            clean_valor = clean_valor.replace('.', '').replace(',', '.')
                        elif ',' in clean_valor:
                            clean_valor = clean_valor.replace(',', '.')
                        
                        # Remove qualquer caractere que não seja número ou ponto
                        import re
                        clean_valor = re.sub(r'[^-0-9.]', '', clean_valor)
                        valor_float = float(clean_valor)
                    else:
                        valor_float = float(raw_valor)
                except:
                    valor_float = 0.0

                # Garantir chaves esperadas pelo view (Case-blind check)
                normalized = {
                    "Status": parsed.get("status", "success"),
                    "Message": parsed.get("message", ""),
                    "Data": parsed.get("data", today),
                    "Tipo": parsed.get("tipo", "Despesa"),
                    "Valor": valor_float,
                    "Descricao": parsed.get("descricao", "Transação via IA"),
                    "Categoria_nome": parsed.get("categoria_nome"),
                    "Categoria_id": cat_id
                }
                return normalized
            return None
        except Exception as e:
            print(f"Erro na IA: {e}")
            return None

class DocumentService:
    """
    Serviço para extração de texto de documentos (PDF e Imagens).
    """
    @staticmethod
    def extract_text(file):
        """
        Detecta o tipo de arquivo e extrai o texto.
        """
        ext = os.path.splitext(file.name)[1].lower()
        
        try:
            if ext == '.pdf':
                return DocumentService._extract_from_pdf(file)
            elif ext in ['.jpg', '.jpeg', '.png', '.bmp']:
                return DocumentService._extract_from_image(file)
            return ""
        except Exception as e:
            print(f"Erro na extração de documento: {e}")
            return ""

    @staticmethod
    def _extract_from_pdf(file):
        if not pdfplumber:
            return "Erro: pdfplumber não instalado."
        
        text = ""
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text

    @staticmethod
    def _extract_from_image(file):
        if not pytesseract or not Image:
            return "Erro: pytesseract ou Pillow não instalados."
        
        # Converte o arquivo em objeto PIL Image
        img = Image.open(file)
        # Extrai o texto usando OCR
        text = pytesseract.image_to_string(img)
        return text

class EvolutionService:
    """Serviço para integração com WhatsApp via Evolution API."""
    def __init__(self):
        self.url = os.getenv('EVOLUTION_API_URL')
        self.key = os.getenv('EVOLUTION_API_KEY')
        self.instance = os.getenv('EVOLUTION_INSTANCE')

    def send_message(self, number, message, instance_id=None):
        """Envia mensagem de texto via WhatsApp (Dinamiza a instância se necessário)."""
        target_instance = instance_id or self.instance
        endpoint = f"{self.url}/message/sendText/{target_instance}"
        
        headers = {'apikey': self.key, 'Content-Type': 'application/json'}
        payload = {
            "number": number,
            "text": message,
            "options": {"delay": 1200, "presence": "composing", "linkPreview": False}
        }
        try:
            print(f"Enviando resposta via WhatsApp para {number} (Instância: {target_instance})...")
            response = requests.post(endpoint, json=payload, headers=headers)
            res_json = response.json()
            print(f"Resposta Evolution: {res_json}")
            return res_json
        except Exception as e:
            print(f"Erro Crítico Evolution (Send): {e}")
            return None
