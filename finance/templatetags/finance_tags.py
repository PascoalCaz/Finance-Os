from django import template
from django.utils.formats import number_format

register = template.Library()

@register.filter
def moeda_kz(value):
    try:
        if value is None:
            return "0,00 Kz"
        
        # Ensure it's a float
        val = float(value)
        
        # Format with 2 decimal places, using localized separators
        # settings.py defines USE_THOUSANDS_SEPARATOR = True, DECIMAL_SEPARATOR = ',', THOUSAND_SEPARATOR = '.'
        formatted = number_format(val, decimal_pos=2, use_l10n=True, force_grouping=True)
        
        return f"{formatted} Kz"
    except (ValueError, TypeError):
        return f"{value} Kz"
