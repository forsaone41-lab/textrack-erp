const SUPABASE_URL = 'https://cyduteruvmpefvemeutm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';

function syncEmailsToSupabase() {
  const startTime = new Date().getTime();
  
  try {
    let label = GmailApp.getUserLabelByName("SyncedToERP");
    if (!label) {
      label = GmailApp.createLabel("SyncedToERP");
    }

    // نأخذ 5 خيوط فقط في كل دفعة لتجنب تجاوز الوقت
    const threads = GmailApp.search('-label:SyncedToERP in:inbox', 0, 5);
    if (!threads || threads.length === 0) {
      Logger.log("✅ Aucun nouvel email à synchroniser.");
      return;
    }

    Logger.log("⏳ Nombre de threads trouvés : " + threads.length);

    for (let i = 0; i < threads.length; i++) {
      // إذا قاربت المدة على 3 دقائق نتوقف لكي يعمل المنبه في المرة القادمة بسلاسة
      if (new Date().getTime() - startTime > 180000) {
        Logger.log("⏱️ Pause pour ne pas dépasser le temps, la suite au prochain tour.");
        break;
      }

      const thread = threads[i];
      try {
        const messages = thread.getMessages();
        for (let j = 0; j < messages.length; j++) {
          const msg = messages[j];
          let fromName = msg.getFrom();
          let fromEmail = msg.getFrom();

          const fromMatch = msg.getFrom().match(/(.*)<(.*)>/);
          if (fromMatch) {
            fromName = fromMatch[1].trim().replace(/^["']|["']$/g, '') || fromMatch[2].trim();
            fromEmail = fromMatch[2].trim();
          }

          let bodyContent = '';
          try {
            bodyContent = (msg.getPlainBody() || msg.getBody() || '').substring(0, 5000);
          } catch (eBody) {
            bodyContent = '(Impossible de lire le contenu)';
          }

          const emailData = {
            gmail_id: msg.getId(),
            from_name: fromName,
            from_email: fromEmail,
            subject: msg.getSubject() || '(sans objet)',
            body: bodyContent,
            received_at: msg.getDate().toISOString(),
            is_read: false
          };

          const url = SUPABASE_URL + '/rest/v1/inbox_emails';
          const options = {
            method: 'post',
            contentType: 'application/json',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + SUPABASE_KEY,
              'Prefer': 'return=minimal'
            },
            payload: JSON.stringify(emailData),
            muteHttpExceptions: true
          };

          const res = UrlFetchApp.fetch(url, options);
          Logger.log("Status: " + res.getResponseCode() + " | Email: " + emailData.subject);
        }
        thread.addLabel(label);
      } catch (threadErr) {
        Logger.log("Erreur thread: " + threadErr.toString());
        try { thread.addLabel(label); } catch (e) {}
      }
    }
    Logger.log("🎉 الدفعة انتهت بنجاح !");
  } catch (err) {
    Logger.log("Erreur: " + err.toString());
  }
}
