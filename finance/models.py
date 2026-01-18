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
