const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// 1. Add isStoreCreated
const stateLine = "const [domainError, setDomainError] = useState('');";
if (content.includes(stateLine) && !content.includes("isStoreCreated")) {
    content = content.replace(stateLine, stateLine + "\n  const [isStoreCreated, setIsStoreCreated] = useState(!!config.storeName);");
}

// 2. Add validation to handleSave
const handleSaveLine = "const handleSave = async () => {\n    setIsSaving(true);";
if (content.includes(handleSaveLine)) {
    content = content.replace(handleSaveLine, "const handleSave = async () => {\n    if (!storeName || !storeName.trim()) {\n        alert(storeIsAr ? '???? ????? ??? ??????? ????? ???? ??????.' : 'Veuillez d\\'abord saisir le nom de la marque.');\n        return;\n    }\n    setIsSaving(true);");
} else {
    // try different newline
    const handleSaveLine2 = "const handleSave = async () => {\r\n    setIsSaving(true);";
    if (content.includes(handleSaveLine2)) {
        content = content.replace(handleSaveLine2, "const handleSave = async () => {\r\n    if (!storeName || !storeName.trim()) {\r\n        alert(storeIsAr ? '???? ????? ??? ??????? ????? ???? ??????.' : 'Veuillez d\\'abord saisir le nom de la marque.');\r\n        return;\r\n    }\r\n    setIsSaving(true);");
    }
}

// 3. Add setIsStoreCreated(true)
const setTimeoutLine = "setTimeout(() => {\n      setIsSaving(false);";
if (content.includes(setTimeoutLine)) {
    content = content.replace(setTimeoutLine, "setIsStoreCreated(true);\n    setTimeout(() => {\n      setIsSaving(false);");
} else {
    const setTimeoutLine2 = "setTimeout(() => {\r\n      setIsSaving(false);";
    if (content.includes(setTimeoutLine2)) {
        content = content.replace(setTimeoutLine2, "setIsStoreCreated(true);\r\n    setTimeout(() => {\r\n      setIsSaving(false);");
    } else {
        // try to find where it's saving
        const lsSet = "localStorage.setItem('beya_store_config', JSON.stringify(storeConfig));";
        content = content.replace(lsSet, lsSet + "\n    setIsStoreCreated(true);");
    }
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Patch 3 applied');
