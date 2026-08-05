const fs = require('fs');
const path = require('path');

const overviewPath = path.resolve('C:\\Users\\hp\\.gemini\\antigravity\\brain\\f7824c0c-86b2-4576-bf4d-1c376516651f\\.system_generated\\logs\\overview.txt');
const aiSpacePath = path.resolve('src/pages/AISpace.tsx');

let content = fs.readFileSync(aiSpacePath, 'utf8');
const lines = fs.readFileSync(overviewPath, 'utf8').split('\n');

const stepIndices = [1609, 1615, 1624, 1630, 1648, 1672, 1708];

let appliedCount = 0;

for (const line of lines) {
  if (!line.includes('replace_file_content') || !line.includes('AISpace.tsx')) continue;
  try {
    const data = JSON.parse(line.trim());
    if (!stepIndices.includes(data.step_index)) continue;
    
    const toolCall = data.tool_calls?.[0];
    if (!toolCall || toolCall.name !== 'replace_file_content') continue;
    
    let target = toolCall.args.TargetContent;
    let replacement = toolCall.args.ReplacementContent;
    const desc = toolCall.args.Description;

    // Remove extra JSON quotes if present
    if (typeof target === 'string' && target.startsWith('"') && target.endsWith('"')) {
      try { target = JSON.parse(target); } catch (e) {}
    }
    if (typeof replacement === 'string' && replacement.startsWith('"') && replacement.endsWith('"')) {
      try { replacement = JSON.parse(replacement); } catch (e) {}
    }

    // Normalize line endings
    const normTarget = target.replace(/\r\n/g, '\n');
    const normReplacement = replacement.replace(/\r\n/g, '\n');
    const normContent = content.replace(/\r\n/g, '\n');

    if (normContent.includes(normTarget)) {
      content = normContent.replace(normTarget, normReplacement);
      appliedCount++;
      console.log(`SUCCESS [${data.step_index}]: ${desc}`);
    } else {
      console.log(`WARNING [${data.step_index}]: Target not found for: ${desc}`);
    }
  } catch (err) {
    // skip parse errors
  }
}

fs.writeFileSync(aiSpacePath, content, 'utf8');
console.log(`\nRestoration complete! Applied ${appliedCount} edits to AISpace.tsx.`);
