import re

with open('src/pages/StoreBuilder.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add City input
def replace_input(match):
    original = match.group(1)
    new_input = original.replace('Delivery Address', 'Ville / City')
    return new_input + '\n' + ' ' * 30 + original

content = re.sub(r'(<input[^>]+placeholder="Delivery Address"[^>]*/>)', replace_input, content)

# Add Free Delivery text
def replace_btn(match):
    original = match.group(1)
    return original + '\n' + ' ' * 30 + '<p className="text-center text-xs font-bold text-green-600 mt-4 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Livraison Gratuite (Paiement à la livraison)</p>'

content = re.sub(r'(Confirm Order \(COD\)</button>)', replace_btn, content)

with open('src/pages/StoreBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
