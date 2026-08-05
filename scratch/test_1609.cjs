const fs = require('fs');
const overviewPath = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\f7824c0c-86b2-4576-bf4d-1c376516651f\\.system_generated\\logs\\overview.txt';
const lines = fs.readFileSync(overviewPath, 'utf8').split('\n');
for (const line of lines) {
  if (line.includes('"step_index":1609')) {
    const data = JSON.parse(line.trim());
    const target = data.tool_calls[0].args.TargetContent;
    console.log("Char around 264:", JSON.stringify(target.slice(250, 275)));
  }
}
