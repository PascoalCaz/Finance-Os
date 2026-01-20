from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
import json
from .services import NocoDBClient, AIClient, DocumentService, EvolutionService
from .models import AppSettings
from django_eventstream import send_event

# Inicialização dos clientes de serviço
client = NocoDBClient()
ai_client = AIClient()

# ==========================================
# DASHBOARD E VISTAS PRINCIPAIS
# ==========================================

@login_required
def dashboard(request):
    """
    Vista principal do Dashboard.
    Calcula KPIs e prepara dados para os gráficos analíticos.
    """
    try:
        from datetime import datetime, timedelta
        from collections import defaultdict
        import calendar

        data = client.get_transactions()
        transactions = data.get('list', [])
        
        # Ordenar transações por Data decrescente (mais recentes primeiro)
        # O NocoDB pode retornar datas como string 'YYYY-MM-DD'
        transactions.sort(key=lambda x: x.get('Data', ''), reverse=True)
        
        def to_float(val):
            try:
                if isinstance(val, (int, float)): return float(val)
                if not val: return 0.0
                clean_val = str(val).replace('.', '').replace(',', '.')
                return float(clean_val)
            except:
                return 0.0

        # 1. Totais Gerais
        income = sum(to_float(t.get('Valor')) for t in transactions if t.get('Tipo') == 'Receita')
        expenses = sum(to_float(t.get('Valor')) for t in transactions if t.get('Tipo') == 'Despesa')
        balance = income - expenses

        # 2. Processamento do Histórico (Filtros: ano, mes, semana, dia)
        today = datetime.now()
        period = request.GET.get('period', 'month') # Default: month
        
        history = {}
        chart_labels = []
        chart_income = []
        chart_expenses = []
        chart_evolution = []
        chart_variation = []
        
        # Filtros de Tempo e Agregação
        if period == 'year':
            # Últimos 5 anos
            for i in range(4, -1, -1):
                year = today.year - i
                key = str(year)
                history[key] = {'label': str(year), 'income': 0.0, 'expenses': 0.0}
            
            for t in transactions:
                try:
                    t_date = datetime.strptime(t.get('Data', ''), '%Y-%m-%d')
                    if t_date.year >= today.year - 4:
                        key = str(t_date.year)
                        if key in history:
                            val = to_float(t.get('Valor'))
                            if t.get('Tipo') == 'Receita': history[key]['income'] += val
                            else: history[key]['expenses'] += val
                except: continue

        elif period == 'week':
            # Últimas 12 semanas
            for i in range(11, -1, -1):
                date = today - timedelta(weeks=i)
                # Início da semana (Segunda)
                start_wa = date - timedelta(days=date.weekday())
                key = start_wa.strftime("%Y-W%W")
                history[key] = {'label': f"S{start_wa.strftime('%W')}", 'income': 0.0, 'expenses': 0.0}
            
            for t in transactions:
                try:
                    t_date = datetime.strptime(t.get('Data', ''), '%Y-%m-%d')
                     # Início da semana da transação
                    start_wt = t_date - timedelta(days=t_date.weekday())
                    key = start_wt.strftime("%Y-W%W")
                    if key in history:
                        val = to_float(t.get('Valor'))
                        if t.get('Tipo') == 'Receita': history[key]['income'] += val
                        else: history[key]['expenses'] += val
                except: continue

        elif period == 'day':
            # Últimos 30 dias
            for i in range(29, -1, -1):
                date = today - timedelta(days=i)
                key = date.strftime("%Y-%m-%d")
                history[key] = {'label': date.strftime("%d/%m"), 'income': 0.0, 'expenses': 0.0}
            
            for t in transactions:
                try:
                    t_date = datetime.strptime(t.get('Data', ''), '%Y-%m-%d')
                    key = t_date.strftime("%Y-%m-%d")
                    if key in history:
                        val = to_float(t.get('Valor'))
                        if t.get('Tipo') == 'Receita': history[key]['income'] += val
                        else: history[key]['expenses'] += val
                except: continue

        else: # Default: 'month' (Últimos 6 meses)
            for i in range(5, -1, -1):
                date = today - timedelta(days=i*30)
                key = date.strftime("%Y-%m")
                history[key] = {
                    'label': calendar.month_name[date.month][:3].capitalize(),
                    'income': 0.0, 'expenses': 0.0
                }
            
            for t in transactions:
                try:
                    t_date = datetime.strptime(t.get('Data', ''), '%Y-%m-%d')
                    key = t_date.strftime("%Y-%m")
                    if key in history:
                        val = to_float(t.get('Valor'))
                        if t.get('Tipo') == 'Receita': history[key]['income'] += val
                        else: history[key]['expenses'] += val
                except: continue

        # Ordenar e Calcular Evolução
        sorted_keys = sorted(history.keys())
        cumulative_balance = 0 # Nota: Isto devia idealmente começar do saldo anterior, mas para visualização relativa serve.
        
        for k in sorted_keys:
            chart_labels.append(history[k]['label'])
            chart_income.append(history[k]['income'])
            chart_expenses.append(history[k]['expenses'])
            net = history[k]['income'] - history[k]['expenses']
            chart_variation.append(net)
            cumulative_balance += net
            chart_evolution.append(cumulative_balance)

        # 3. Distribuição por Categoria
        def get_cat_name(trans):
            relations = trans.get('_nc_m2m_Financeiro_Categoria', [])
            if relations and isinstance(relations, list):
                cat = relations[0].get('Categoria', {})
                return cat.get('nome', 'Sem Categoria')
            return "Sem Categoria"

        categories_summary = defaultdict(float)
        for t in transactions:
            if t.get('Tipo') == 'Despesa':
                cat_name = get_cat_name(t)
                categories_summary[cat_name] += to_float(t.get('Valor'))

        context = {
            'income': income,
            'expenses': expenses,
            'balance': balance,
            'chart_labels': chart_labels,
            'chart_income': chart_income,
            'chart_expenses': chart_expenses,
            'chart_evolution': chart_evolution,
            'chart_variation': chart_variation,
            'categories_summary': dict(categories_summary),
            'recent_transactions': transactions[:10],
            'active_period': period,
        }
        return render(request, 'finance/dashboard.html', context)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return render(request, 'finance/error.html', {'error': f"Erro ao carregar Dashboard Analítico: {e}"})

def get_financial_context():
    """
    Gera um resumo textual do estado financeiro atual para a IA.
    """
    try:
        data = client.get_transactions()
        transactions = data.get('list', [])
        
        def to_float(val):
            try:
                if isinstance(val, (int, float)): return float(val)
                if not val: return 0.0
                return float(str(val).replace('.', '').replace(',', '.'))
            except: return 0.0

        income = sum(to_float(t.get('Valor')) for t in transactions if t.get('Tipo') == 'Receita')
        expenses = sum(to_float(t.get('Valor')) for t in transactions if t.get('Tipo') == 'Despesa')
        
        from collections import defaultdict
        cat_totals = defaultdict(float)
        for t in transactions:
            if t.get('Tipo') == 'Despesa':
                relations = t.get('_nc_m2m_Financeiro_Categoria', [])
                cat_name = relations[0].get('Categoria', {}).get('nome', 'Outros') if relations else 'Outros'
                cat_totals[cat_name] += to_float(t.get('Valor'))
        
        top_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)[:3]
        top_cats_str = ", ".join([f"{c}: {v} Kz" for c, v in top_cats])
        
        recent = []
        for t in transactions[:5]:
            recent.append(f"- {t.get('Data')}: {t.get('Descricao')} ({t.get('Valor')} Kz)")
        
        context = f"""
        Saldo Atual: {income - expenses} Kz
        Total Receitas: {income} Kz
        Total Despesas: {expenses} Kz
        Maiores Gastos por Categoria: {top_cats_str}
        Transações Recentes:
        {"\n".join(recent)}
        """
        return context
    except Exception as e:
        print(f"Erro ao gerar contexto: {e}")
        return "Erro ao carregar contexto financeiro."

# ==========================================
# GESTÃO DE TRANSAÇÕES (CRUD)
# ==========================================

@login_required
def transaction_list(request):
    """Lista todas as transações, com suporte a filtro por categoria."""
    cat_id = request.GET.get('category_id')
    data = client.get_transactions()
    transactions = data.get('list', [])
    
    active_category = None
    
    # Resolver nomes das categorias e aplicar filtro se necessário
    resolved_transactions = []
    for t in transactions:
        relations = t.get('_nc_m2m_Financeiro_Categoria', [])
        cat_name = 'Sem Categoria'
        current_cat_id = None
        
        if relations and isinstance(relations, list):
            cat_obj = relations[0].get('Categoria', {})
            cat_name = cat_obj.get('nome', 'Sem Categoria')
            current_cat_id = cat_obj.get('Id')
            
        t['Categoria_nome'] = cat_name
        
        # Filtro por ID de categoria (NocoDB retorna como int ou string dependendo da versão)
        if not cat_id or str(current_cat_id) == str(cat_id):
            resolved_transactions.append(t)
            if str(current_cat_id) == str(cat_id):
                active_category = cat_name

    # Ordenar por data decrescente
    resolved_transactions.sort(key=lambda x: x.get('Data', ''), reverse=True)
            
    return render(request, 'finance/transactions_list.html', {
        'transactions': resolved_transactions,
        'active_category': active_category,
        'cat_id': cat_id
    })

@login_required
def transaction_create(request):
    """Cria uma nova transação ou exibe o formulário."""
    if request.method == "POST":
        data = {
            "Data": request.POST.get("Data"),
            "Tipo": request.POST.get("Tipo"),
            "Valor": float(request.POST.get("Valor")),
            "Descricao": request.POST.get("Descricao"),
        }
        cat_id = request.POST.get("Categoria")
        if cat_id:
            data["Categoria"] = int(cat_id)
        
        client.create_transaction(data)
        return redirect('dashboard')
    
    # Busca categorias para o dropdown do formulário
    categories = client.get_categories().get('list', [])
    return render(request, 'finance/forms/transaction_form.html', {'categories': categories})

@login_required
def transaction_delete(request, record_id):
    """Remove uma transação específica."""
    if request.method == "DELETE" or request.GET.get('confirm') == 'true':
        client.delete_transaction(record_id)
        return redirect('dashboard')
    return render(request, 'finance/error.html', {'error': 'Método não permitido'})

# ==========================================
# GESTÃO DE CATEGORIAS (CRUD)
# ==========================================

@login_required
def category_list(request):
    """Lista todas as categorias."""
    data = client.get_categories()
    categories = data.get('list', [])
    return render(request, 'finance/categories_list.html', {'categories': categories})

@login_required
def category_create(request):
    """Cria uma nova categoria ou exibe o formulário."""
    if request.method == "POST":
        data = {"nome": request.POST.get("nome")}
        client.create_category(data)
        return redirect('categories')
    return render(request, 'finance/forms/category_form.html')

@login_required
def category_delete(request, record_id):
    """Remove uma categoria específica."""
    client.delete_category(record_id)
    return redirect('categories')

# ==========================================
# ASSISTENTE DE IA (OLLAMA/QWEN)
# ==========================================

@login_required
def ai_process(request):
    """
    Processa entrada de linguagem natural e documentos via IA.
    Transformado para suporte a CHAT conversacional.
    """
    if request.method == "POST":
        text = request.POST.get("ai_text", "")
        auto_reg = request.POST.get("ai_auto") == "true"
        provider = request.POST.get("ai_provider") or request.session.get('ai_provider')
        
        # Gestão de Provedor
        if provider: request.session['ai_provider'] = provider
            
        # 1. Obter Contexto
        categories = client.get_categories().get('list', [])
        financial_context = get_financial_context()
        
        # 2. Processamento de Ficheiro (Se houver)
        uploaded_file = request.FILES.get('ai_file')
        if uploaded_file:
            doc_text = DocumentService.extract_text(uploaded_file)
            if doc_text:
                text = f"{text}\n\n[DOCUMENTO]:\n{doc_text}"

        # 3. Chamar IA Conversacional
        result = ai_client.process_user_intent(text, financial_context, categories)
        
        if result:
            intent = result.get('intent')
            data = result.get('data', {})
            response_text = result.get('response', "Não consegui processar o pedido.")

            # Tratar Intenções
            if intent == "register_transaction":
                if auto_reg and data.get('Categoria_id'):
                    client.create_transaction({
                        "Data": data.get("Data"),
                        "Tipo": data.get("Tipo"),
                        "Valor": data.get("Valor"),
                        "Descricao": data.get("Descricao"),
                        "Categoria": int(data["Categoria_id"])
                    })
                    return render(request, 'finance/partials/ai_chat_bubble.html', {
                        'response': f"✅ Registado: {data.get('Descricao')} ({data.get('Valor')} Kz)",
                        'is_ai': True
                    })
                else:
                    # Se não for auto ou faltar categoria, abre modal de confirmação
                    parsed = {
                        "Data": data.get("Data"),
                        "Tipo": data.get("Tipo"),
                        "Valor": data.get("Valor"),
                        "Descricao": data.get("Descricao"),
                        "Categoria_nome": data.get("Categoria_nome"),
                        "Categoria_id": data.get("Categoria_id")
                    }
                    return render(request, 'finance/partials/ai_confirmation.html', {
                        'parsed': parsed, 
                        'categories': categories
                    })

            elif intent == "manage_categories" and data.get("nova_categoria_nome"):
                new_name = data.get("nova_categoria_nome")
                client.create_category({"nome": new_name})
                return render(request, 'finance/partials/ai_chat_bubble.html', {
                    'response': f"📂 Categoria '{new_name}' criada com sucesso!",
                    'is_ai': True
                })

            # Para reports, análise ou chat geral
            return render(request, 'finance/partials/ai_chat_bubble.html', {
                'response': response_text,
                'is_ai': True
            })

        return render(request, 'finance/partials/ai_chat_bubble.html', {
            'response': "Desculpa, tive um problema ao processar isso. Tenta novamente.",
            'is_ai': True
        })
    return redirect('dashboard')

@login_required
def ai_confirm(request):
    """Finaliza o registro da transação após confirmação do usuário."""
    if request.method == "POST":
        data = {
            "Data": request.POST.get("Data"),
            "Tipo": request.POST.get("Tipo"),
            "Valor": float(request.POST.get("Valor")),
            "Descricao": request.POST.get("Descricao"),
        }
        cat_id = request.POST.get("Categoria_id")
        if cat_id and cat_id != "None":
            data["Categoria"] = int(cat_id)
            
        client.create_transaction(data)
        # Limpa o contexto da sessão após confirmação manual
        request.session['ai_last_doc_text'] = ""
        
        # Notificar Real-time via SSE
        send_event('finance', 'message', {'text': 'refresh'})
        
        return redirect('dashboard')
    return redirect('dashboard')

# ==========================================
# CONFIGURAÇÕES DO SISTEMA
# ==========================================

@login_required
def settings_view(request):
    """Gere as configurações globais da aplicação."""
    settings = AppSettings.get_settings()
    
    if request.method == "POST":
        form_type = request.POST.get("form_type")
        
        if form_type == "ai_settings":
            settings.default_ai_provider = request.POST.get("default_ai_provider")
            settings.ollama_url = request.POST.get("ollama_url")
            settings.ollama_model = request.POST.get("ollama_model")
            settings.openai_api_key = request.POST.get("openai_api_key")
            settings.deepseek_api_key = request.POST.get("deepseek_api_key")
            settings.gemini_api_key = request.POST.get("gemini_api_key")
            settings.anthropic_api_key = request.POST.get("anthropic_api_key")
        else:
            # WhatsApp Form (Old structure)
            settings.whatsapp_instance_id = request.POST.get("whatsapp_instance_id")
            
        settings.save()
        return redirect('settings')
        
    return render(request, 'finance/settings_list.html', {
        'settings': settings
    })

@csrf_exempt
def whatsapp_webhook(request):
    """Webhook para processar mensagens da Evolution API (WhatsApp)."""
    if request.method != 'POST':
        return HttpResponse("Method not allowed", status=405)
    
    try:
        payload = json.loads(request.body)
        event = payload.get('event')
        
        if event == 'messages.upsert':
            data = payload.get('data', {})
            instance_id_payload = payload.get('instanceId') or data.get('instanceId')
            # Nome da instância para enviar mensagens (Evolution API usa o nome, não o UUID)
            instance_name = payload.get('instance')  # Ex: 'NOTE 14 JUNIOR'
            
            # 1. Verificar Filtro de Instância
            settings = AppSettings.get_settings()
            if settings.whatsapp_instance_id and str(instance_id_payload) != str(settings.whatsapp_instance_id):
                print(f"Webhook Ignorado: Instância {instance_id_payload} não corresponde à configurada ({settings.whatsapp_instance_id})")
                return JsonResponse({"status": "ignored", "reason": "instance_mismatch"})

            message_obj = data.get('message', {})
            key_obj = data.get('key', {})
            
            if key_obj.get('fromMe'):
                return JsonResponse({"status": "ignored"})

            remote_jid = key_obj.get('remoteJid', '')
            # Extrair apenas o número (sem @s.whatsapp.net ou @lid)
            user_number = remote_jid.split('@')[0] if remote_jid else ''
            
            text_context = ""
            if 'conversation' in message_obj:
                text_context = message_obj['conversation']
            elif 'extendedTextMessage' in message_obj:
                text_context = message_obj['extendedTextMessage'].get('text', '')
            elif 'imageMessage' in message_obj:
                text_context = message_obj['imageMessage'].get('caption', 'Documento WhatsApp')
            
            if text_context:
                print(f"Processando mensagem de {user_number}: {text_context[:50]}...")
                # 1. Obter Contexto e Categorias
                financial_context = get_financial_context()
                categories_data = client.get_categories().get('list', [])
                
                # 2. IA para interpretar intenção e contexto
                ai_result = ai_client.process_user_intent(text_context, financial_context, categories_data)
                
                if ai_result:
                    intent = ai_result.get('intent')
                    data = ai_result.get('data', {})
                    response_msg = ai_result.get('response', "Entendido!")
                    
                    print(f"Intenção Detectada: {intent}")
                    
                    # 3. Executar Ação baseada na Intenção
                    if intent == "register_transaction":
                        client.create_transaction({
                            'Data': data.get('Data'),
                            'Tipo': data.get('Tipo'),
                            'Valor': data.get('Valor'),
                            'Descricao': data.get('Descricao'),
                            'Categoria_id': data.get('Categoria_id')
                        })
                        send_event('finance', 'message', {'text': 'refresh'})
                    
                    elif intent == "manage_categories" and data.get("nova_categoria_nome"):
                        new_cat_name = data.get("nova_categoria_nome")
                        client.create_category({"nome": new_cat_name})
                        print(f"Nova categoria criada via WhatsApp: {new_cat_name}")
                        # Opcionalmente enviar evento se houver listener na lista de categorias
                    
                    # 4. Enviar Resposta via WhatsApp
                    evo = EvolutionService()
                    print(f"Enviando resposta para {user_number} via instância '{instance_name}'")
                    evo.send_message(user_number, response_msg, instance_id=instance_name)
                    
        return JsonResponse({"status": "success"})
    except Exception as e:
        print(f"Erro Webhook: {e}")
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
