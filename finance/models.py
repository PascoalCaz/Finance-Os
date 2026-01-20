from django.db import models

class AppSettings(models.Model):
    """
    Configurações globais da aplicação FinanceOS.
    """
    whatsapp_instance_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        verbose_name="ID da Instância WhatsApp",
        help_text="ID da instância da Evolution API (ex: bc8e8300-...)"
    )
    
    whatsapp_allowed_numbers = models.TextField(
        blank=True, 
        null=True,
        default="244956834375@s.whatsapp.net",
        verbose_name="Números Permitidos (WhatsApp)",
        help_text="Lista de JIDs ou números autorizados, separados por vírgula. Ex: 244956834375@s.whatsapp.net, 123456789"
    )

    # Configurações de IA
    AI_PROVIDERS = [
        ('ollama', 'Ollama (Qwen)'),
        ('deepseek', 'DeepSeek'),
        ('openai', 'OpenAI'),
        ('gemini', 'Google Gemini'),
        ('anthropic', 'Anthropic (Claude)'),
    ]
    
    default_ai_provider = models.CharField(
        max_length=20, 
        choices=AI_PROVIDERS, 
        default='ollama',
        verbose_name="Provedor de IA Padrão"
    )

    ollama_url = models.URLField(
        default="https://eden-ollama.w2zld5.easypanel.host/v1",
        verbose_name="URL do Ollama"
    )
    ollama_model = models.CharField(
        max_length=100,
        default="qwen2.5-coder:3b-instruct-q4_K_M",
        verbose_name="Modelo Ollama"
    )

    deepseek_api_key = models.CharField(max_length=255, blank=True, null=True, verbose_name="DeepSeek API Key")
    openai_api_key = models.CharField(max_length=255, blank=True, null=True, verbose_name="OpenAI API Key")
    gemini_api_key = models.CharField(max_length=255, blank=True, null=True, verbose_name="Gemini API Key")
    anthropic_api_key = models.CharField(max_length=255, blank=True, null=True, verbose_name="Anthropic API Key")
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuração"
        verbose_name_plural = "Configurações"

    def __str__(self):
        return "Configurações do Sistema"

    @classmethod
    def get_settings(cls):
        """Retorna as configurações atuais ou cria uma padrão."""
        settings, _ = cls.objects.get_or_create(id=1)
        return settings
