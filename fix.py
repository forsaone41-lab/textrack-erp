import os

with open('src/pages/StoreBuilder.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

search_str = "onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)}"
replace_str = "onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)}"

c = c.replace(search_str, replace_str)

with open('src/pages/StoreBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
