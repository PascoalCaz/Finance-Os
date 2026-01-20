from django.urls import path
from . import views
import django_eventstream

urlpatterns = [
    # Dashboard Principal
    path('', views.dashboard, name='dashboard'),
    path('dashboard/', views.dashboard, name='dashboard_alt'),

    # Gestão de Transações
    path('transactions/', views.transaction_list, name='transactions'),
    path('transactions/create/', views.transaction_create, name='transaction_create'),
    path('transactions/delete/<int:record_id>/', views.transaction_delete, name='transaction_delete'),

    # Gestão de Categorias
    path('categories/', views.category_list, name='categories'),
    path('categories/create/', views.category_create, name='category_create'),
    path('categories/delete/<int:record_id>/', views.category_delete, name='category_delete'),

    # Funcionalidades de IA (Assistente Flutuante)
    path('ai/process/', views.ai_process, name='ai_process'),
    path('ai/confirm/', views.ai_confirm, name='ai_confirm'),
    # Webhook da Evolution API (WhatsApp)
    path('api/whatsapp/webhook/', views.whatsapp_webhook, name='whatsapp_webhook'),
    # Configurações do Sistema
    path('settings/', views.settings_view, name='settings'),
    
    # SSE - Real-time Events
    path('events/', django_eventstream.views.events, {'channels': ['finance']}, name='events'),
]
