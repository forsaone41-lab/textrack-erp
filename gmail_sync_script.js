const SUPABASE_URL = 'https://cyduteruvmpefvemeutm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';

function syncEmailsToSupabase() {
  // إنشاء تصنيف باش نعلمو الرسائل لي ديجا دازو للسيت
  let label = GmailApp.getUserLabelByName("SyncedToERP");
  if (!label) {
    label = GmailApp.createLabel("SyncedToERP");
  }
  
  // نقلبوا على الرسائل لي مزال مادازوش للسيت (حد 10 فكل مرة)
  const threads = GmailApp.search('-label:SyncedToERP in:inbox', 0, 10);
  
  if (threads.length === 0) {
    Logger.log("Aucun nouvel email à synchroniser.");
    return;
  }
  
  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];
      
      let fromName = msg.getFrom();
      let fromEmail = msg.getFrom();
      
      // عزل الإسم على الإيميل إذا كانو بجوج (مثلا: "Ahmed <ahmed@gmail.com>")
      const fromMatch = msg.getFrom().match(/(.*)<(.*)>/);
      if (fromMatch) {
        fromName = fromMatch[1].trim() || fromMatch[2].trim();
        fromEmail = fromMatch[2].trim();
      }

      const emailData = {
        gmail_id: msg.getId(),
        from_name: fromName,
        from_email: fromEmail,
        subject: msg.getSubject(),
        body: msg.getPlainBody().substring(0, 5000),
        received_at: msg.getDate().toISOString(),
        is_read: false
      };
      
      // إرسال البيانات لقاعدة البيانات ديال السيت (Supabase)
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
      
      try {
        const response = UrlFetchApp.fetch(url, options);
        Logger.log("Sync success: " + msg.getSubject() + " | Status: " + response.getResponseCode());
      } catch (e) {
        Logger.log("Error syncing email: " + e.toString());
      }
    }
    // تعليم الرسالة بلي راها دازت باش مانعاودوش نصيفطوها
    threads[i].addLabel(label);
  }
}
