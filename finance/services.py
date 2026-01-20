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
    Cliente para integração com LLMs (Ollama, DeepSeek, OpenAI, Gemini, Anthropic).
    """
    def __init__(self, provider=None):
        self._settings = None
        self._explicit_provider = provider

    @property
    def settings(self):
        if self._settings is None:
            from .models import AppSettings
            try:
                self._settings = AppSettings.get_settings()
            except Exception as e:
                print(f"Erro ao carregar AppSettings (IA): {e}")
                # Fallback para um objeto vazio ou mock se a DB não estiver pronta
                return None
        return self._settings

    @property
    def provider(self):
        if self._explicit_provider:
            return self._explicit_provider
        return self.settings.default_ai_provider if self.settings else os.getenv("AI_PROVIDER", "ollama")

    @property
    def ollama_url(self):
        return self.settings.ollama_url if self.settings else "https://eden-ollama.w2zld5.easypanel.host/v1"

    @property
    def ollama_model(self):
        return self.settings.ollama_model if self.settings else "qwen2.5-coder:3b-instruct-q4_K_M"

    @property
    def deepseek_key(self):
        return (self.settings.deepseek_api_key if self.settings else None) or os.getenv("DEEPSEEK_API_KEY")

    @property
    def openai_key(self):
        return (self.settings.openai_api_key if self.settings else None) or os.getenv("OPENAI_API_KEY")

    @property
    def gemini_key(self):
        return (self.settings.gemini_api_key if self.settings else None) or os.getenv("GEMINI_API_KEY")

    @property
    def anthropic_key(self):
        return (self.settings.anthropic_api_key if self.settings else None) or os.getenv("ANTHROPIC_API_KEY")

    def _call_ollama(self, prompt):
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
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.deepseek_key, base_url="https://api.deepseek.com")
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "user", "content": prompt}],
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Erro no DeepSeek: {e}")
            return None

    def _call_openai(self, prompt):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.openai_key)
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Erro no OpenAI: {e}")
            return None

    def _call_gemini(self, prompt):
        try:
            # Usando requisição direta via REST para evitar dependências pesadas
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            print(f"Erro no Gemini: {e}")
            return None

    def _call_anthropic(self, prompt):
        try:
            headers = {
                "x-api-key": self.anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            payload = {
                "model": "claude-3-5-sonnet-20240620",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": prompt}]
            }
            response = requests.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers)
            response.raise_for_status()
            return response.json()['content'][0]['text']
        except Exception as e:
            print(f"Erro no Anthropic: {e}")
            return None

    def process_user_intent(self, text, financial_context, categories):
        """
        Processa a intenção do utilizador com base no texto e no contexto financeiro.
        Suporta: Registar, Relatórios, Análise e Gestão de Categorias.
        """
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        cat_list = ", ".join([c['nome'] for c in categories])
        
        prompt = f"""Você é o FinanceOS AI, um assistente financeiro inteligente e direto.
Sua missão é ajudar o usuário a gerir finanças via WhatsApp.

CONTEXTO FINANCEIRO ATUAL:
{financial_context}

CATEGORIAS DISPONÍVEIS: {cat_list}
DATA ATUAL: {today}

ENTRADA DO USUÁRIO: "{text}"

INSTRUÇÕES:
1. Identifique a INTENÇÃO do usuário:
   - "register_transaction": Se ele descrever um gasto ou ganho.
   - "generate_report": Se ele pedir saldo, gastos do dia/mês ou o que tem na conta.
   - "analyze_finances": Se ele pedir conselhos, perguntar onde gasta mais ou pedir um resumo.
   - "manage_categories": Se ele pedir para listar categorias ou criar uma nova.
   - "chat": Se for apenas uma saudação ou conversa geral sem ação financeira.

2. Responda em JSON rigoroso com este formato:
{{
    "intent": "register_transaction" | "generate_report" | "analyze_finances" | "manage_categories" | "chat",
    "data": {{ ... dados específicos da ação como 'Valor', 'Tipo', 'Categoria_nome', 'nova_categoria_nome' ... }},
    "response": "Uma resposta educada, curta e profissional em português para enviar de volta ao WhatsApp."
}}

REGRAS DE RESPOSTA:
- Se for "register_transaction", extraia os dados como antes.
- Se for "generate_report" ou "analyze_finances", use o CONTEXTO FINANCEIRO fornecido para responder com precisão na chave "response".
- Seja conciso e use emojis de forma elegante.
- Se não entender, defina intent como "chat" e peça para ser mais específico no campo "response"."""
        
        try:
            if self.provider == "deepseek":
                content = self._call_deepseek(prompt)
            elif self.provider == "openai":
                content = self._call_openai(prompt)
            elif self.provider == "gemini":
                content = self._call_gemini(prompt)
            elif self.provider == "anthropic":
                content = self._call_anthropic(prompt)
            else:
                content = self._call_ollama(prompt)

            if not content:
                return None
            
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                import json
                raw_data = json.loads(json_match.group(0))
                
                # Normalização mínima de chaves
                intent = raw_data.get("intent", "chat")
                data = raw_data.get("data", {})
                response_text = raw_data.get("response", "Entendido.")
                
                # Processamento extra para registo (mesma lógica robusta de antes)
                if intent == "register_transaction":
                    # Mapear categoria_id
                    cat_name = data.get("Categoria_nome")
                    cat_id = None
                    if cat_name:
                        for c in categories:
                            if str(c['nome']).lower() == str(cat_name).lower():
                                cat_id = c['Id']
                                break
                    data["Categoria_id"] = cat_id
                    
                    # Normalizar valor
                    raw_valor = data.get("Valor", 0.0)
                    try:
                        if isinstance(raw_valor, str):
                            clean = re.sub(r'[^-0-9,.]', '', raw_valor).replace(',', '.')
                            data["Valor"] = float(clean)
                        else:
                            data["Valor"] = float(raw_valor)
                    except:
                        data["Valor"] = 0.0
                    
                    if "Data" not in data:
                        data["Data"] = today
                    if "Tipo" not in data:
                        data["Tipo"] = "Despesa"

                return {
                    "intent": intent,
                    "data": data,
                    "response": response_text
                }
            return None
        except Exception as e:
            print(f"Erro na IA Process: {e}")
            return None

    def parse_transaction(self, text, categories, provider=None):
        """Método legado mantendo compatibilidade se necessário (pode ser removido futuramente)."""
        # Em vez de duplicar, chamamos o novo método com contexto vazio para manter o fluxo antigo se disparado por outras partes
        res = self.process_user_intent(text, "Sem contexto detalhado.", categories)
        if res and res['intent'] == "register_transaction":
            res['data']['Status'] = 'success'
            return res['data']
        return {"Status": "error"}

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
