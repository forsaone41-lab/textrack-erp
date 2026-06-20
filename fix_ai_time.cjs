const fs = require('fs');

let content = fs.readFileSync('src/pages/ChaineDetaillee.tsx', 'utf8').replace(/\r\n/g, '\n');

const target = `  const runAIBalancing = () => {
    // Only use atelier workers
    const availableWorkers = employes.filter(e => e.type === 'atelier');
    if (availableWorkers.length === 0) {
      alert(isAr ? "المرجو إضافة عمال الورشة (Atelier) أولاً في قسم الموارد البشرية." : "Veuillez ajouter des employés d'atelier d'abord.");
      return;
    }

    const newAssignments = { ...assignments };
    const explanations: Record<string, string> = {};

    modelOps.forEach((op) => {
      let bestWorker = '';
      let bestScore = -1;
      let reason = '';

      // Match by past performance
      availableWorkers.forEach(emp => {
        const pastPerformances = suivi.filter(s => s.employe_id === emp.id && s.operation_id === op.id);
        if (pastPerformances.length > 0) {
          const avgQty = pastPerformances.reduce((acc, curr) => acc + curr.quantite_realisee, 0) / pastPerformances.length;
          const efficiency = (avgQty / op.target_heure) * 100;
          if (efficiency > bestScore) {
            bestScore = efficiency;
            bestWorker = emp.id;
            reason = isAr 
              ? \`كفاءة عالية ومستقرة في هذا المركز بمتوسط \${Math.round(avgQty)} قطعة/ساعة (\${Math.round(efficiency)}%)\`
              : \`Haute performance stable à ce poste avec une moyenne de \${Math.round(avgQty)} pcs/h (\${Math.round(efficiency)}%)\`;
          }
        }
      });

      // Smart match by role keywords
      if (!bestWorker) {
        const matchedRoleWorker = availableWorkers.find(emp => {
          const posteStr = (emp.poste || '').toLowerCase();
          const opStr = op.nom_operation.toLowerCase();
          if (!posteStr) return false;

          // Direct includes check
          if (posteStr.includes(opStr) || opStr.includes(posteStr)) return true;

          // Sewing industry fuzzy matching
          const getBaseWord = (s) => {
            if (s.includes('piq')) return 'piq';
            if (s.includes('surj') || s.includes('serge')) return 'surj';
            if (s.includes('repas') || s.includes('iron')) return 'repas';
            if (s.includes('coup') || s.includes('cut')) return 'coup';
            if (s.includes('embal') || s.includes('pack')) return 'embal';
            return null;
          };

          const posteBase = getBaseWord(posteStr);
          const opBase = getBaseWord(opStr);
          
          if (posteBase && opBase && posteBase === opBase) return true;

          return false;
        });

        if (matchedRoleWorker) {
          bestWorker = matchedRoleWorker.id;
          reason = isAr
            ? \`مطابقة المهنة والخبرة للمركز المحدد (\${matchedRoleWorker.poste})\`
            : \`Correspondance parfaite du profil et du poste (\${matchedRoleWorker.poste})\`;
        }
      }

      // Match by general availability
      if (!bestWorker && availableWorkers.length > 0) {
        const fallbackWorker = availableWorkers[Math.floor(Math.random() * availableWorkers.length)];
        if (fallbackWorker) {
          bestWorker = fallbackWorker.id;
          reason = isAr
            ? \`تم التعيين بشكل عشوائي للضرورة لعدم تطابق المناصب\`
            : \`Assigné par défaut (Aucune spécialité correspondante trouvée)\`;
        }
      }

      if (bestWorker) {
        newAssignments[op.id] = {
          empId: bestWorker,
          startHour: availableHours[0] || '08:00',
          endHour: availableHours[availableHours.length - 1] || '18:00'
        };
        explanations[op.id] = reason;

        if (availableWorkers.length > modelOps.length) {
          const index = availableWorkers.findIndex(w => w.id === bestWorker);
          if (index !== -1) availableWorkers.splice(index, 1);
        }
      }
    });

    setAssignments(newAssignments);
    setAiRecommendation(explanations);
    setShowAIPanel(true);
  };`;

const replacement = `  const runAIBalancing = () => {
    // Only use atelier workers
    const availableWorkers = employes.filter(e => e.type === 'atelier');
    if (availableWorkers.length === 0) {
      alert(isAr ? "المرجو إضافة عمال الورشة (Atelier) أولاً في قسم الموارد البشرية." : "Veuillez ajouter des employés d'atelier d'abord.");
      return;
    }

    const newAssignments: typeof assignments = { ...assignments };
    const explanations: Record<string, string> = {};

    // 1. Initial assignment
    // Keep track of how many times a worker is assigned
    const workerAssignments: Record<string, string[]> = {};
    const unassignedWorkers = [...availableWorkers];

    modelOps.forEach((op) => {
      let bestWorker = '';
      let bestScore = -1;
      let reason = '';

      // Match by past performance first
      unassignedWorkers.forEach(emp => {
        const pastPerformances = suivi.filter(s => s.employe_id === emp.id && s.operation_id === op.id);
        if (pastPerformances.length > 0) {
          const avgQty = pastPerformances.reduce((acc, curr) => acc + curr.quantite_realisee, 0) / pastPerformances.length;
          const efficiency = (avgQty / op.target_heure) * 100;
          if (efficiency > bestScore) {
            bestScore = efficiency;
            bestWorker = emp.id;
            reason = isAr 
              ? \`كفاءة عالية ومستقرة في هذا المركز بمتوسط \${Math.round(avgQty)} قطعة/ساعة (\${Math.round(efficiency)}%)\`
              : \`Haute performance stable à ce poste avec une moyenne de \${Math.round(avgQty)} pcs/h (\${Math.round(efficiency)}%)\`;
          }
        }
      });

      // Smart match by role keywords
      if (!bestWorker) {
        const matchedRoleWorker = unassignedWorkers.find(emp => {
          const posteStr = (emp.poste || '').toLowerCase();
          const opStr = op.nom_operation.toLowerCase();
          if (!posteStr) return false;

          // Direct includes check
          if (posteStr.includes(opStr) || opStr.includes(posteStr)) return true;

          // Sewing industry fuzzy matching
          const getBaseWord = (s: string) => {
            if (s.includes('piq')) return 'piq';
            if (s.includes('surj') || s.includes('serge')) return 'surj';
            if (s.includes('repas') || s.includes('iron')) return 'repas';
            if (s.includes('coup') || s.includes('cut')) return 'coup';
            if (s.includes('embal') || s.includes('pack')) return 'embal';
            return null;
          };

          const posteBase = getBaseWord(posteStr);
          const opBase = getBaseWord(opStr);
          
          if (posteBase && opBase && posteBase === opBase) return true;

          return false;
        });

        if (matchedRoleWorker) {
          bestWorker = matchedRoleWorker.id;
          reason = isAr
            ? \`مطابقة المهنة والخبرة للمركز المحدد (\${matchedRoleWorker.poste})\`
            : \`Correspondance parfaite du profil et du poste (\${matchedRoleWorker.poste})\`;
        }
      }

      // Match by general availability
      if (!bestWorker && unassignedWorkers.length > 0) {
        const fallbackWorker = unassignedWorkers[Math.floor(Math.random() * unassignedWorkers.length)];
        if (fallbackWorker) {
          bestWorker = fallbackWorker.id;
          reason = isAr
            ? \`تم التعيين بشكل عشوائي للضرورة لعدم تطابق المناصب\`
            : \`Assigné par défaut (Aucune spécialité correspondante trouvée)\`;
        }
      }

      // If we completely run out of unassigned workers, we must reuse existing workers based on skill/post
      if (!bestWorker && availableWorkers.length > 0) {
         // find best matching worker from ALL workers
         const forcedWorker = availableWorkers.find(emp => {
          const posteStr = (emp.poste || '').toLowerCase();
          const opStr = op.nom_operation.toLowerCase();
          if (!posteStr) return false;
          if (posteStr.includes(opStr) || opStr.includes(posteStr)) return true;
          return false;
         }) || availableWorkers[0];
         
         bestWorker = forcedWorker.id;
         reason = isAr ? \`تم إسناد مهمة إضافية بسبب نقص العمال\` : \`Tâche supplémentaire assignée suite au manque d'effectif\`;
      }

      if (bestWorker) {
        if (!workerAssignments[bestWorker]) workerAssignments[bestWorker] = [];
        workerAssignments[bestWorker].push(op.id);
        explanations[op.id] = reason;

        // remove from unassigned to prioritize others for next ops
        const index = unassignedWorkers.findIndex(w => w.id === bestWorker);
        if (index !== -1) unassignedWorkers.splice(index, 1);
      }
    });

    // 2. Time Splitting
    // For workers with multiple operations, split their day
    Object.entries(workerAssignments).forEach(([empId, opIds]) => {
      const numOps = opIds.length;
      if (numOps === 1) {
        newAssignments[opIds[0]] = {
          empId,
          startHour: availableHours[0] || '08:00',
          endHour: availableHours[availableHours.length - 1] || '18:00'
        };
      } else {
        // divide hours evenly
        const hoursPerOp = Math.floor(availableHours.length / numOps);
        opIds.forEach((opId, i) => {
          const startIdx = i * hoursPerOp;
          const endIdx = i === numOps - 1 ? availableHours.length - 1 : (i + 1) * hoursPerOp;
          newAssignments[opId] = {
            empId,
            startHour: availableHours[startIdx],
            endHour: availableHours[endIdx]
          };
        });
      }
    });

    setAssignments(newAssignments);
    setAiRecommendation(explanations);
    setShowAIPanel(true);
  };`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/ChaineDetaillee.tsx', content, 'utf8');
  console.log('Successfully updated runAIBalancing with Time Splitting');
} else {
  console.log('Could not find runAIBalancing target');
  
  // Fallback: Splice by searching lines
  let lines = content.split('\n');
  const startIdx = lines.findIndex(l => l.includes('const runAIBalancing = () => {'));
  if (startIdx !== -1) {
    let endIdx = startIdx;
    while(endIdx < lines.length) {
      if (lines[endIdx] === '  };' && lines[endIdx-1].includes('setShowAIPanel(true);')) {
        break;
      }
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines.splice(startIdx, endIdx - startIdx + 1, ...replacement.split('\n'));
      fs.writeFileSync('src/pages/ChaineDetaillee.tsx', lines.join('\n'), 'utf8');
      console.log('Successfully updated runAIBalancing using splice');
    }
  }
}
