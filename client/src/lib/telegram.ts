interface TelegramBot {
  sendMessage(chatId: string, text: string): Promise<void>;
  setWebhook(url: string): Promise<void>;
}

export class TelegramBotClient implements TelegramBot {
  private botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }
  }

  async setWebhook(url: string): Promise<void> {
    const apiUrl = `https://api.telegram.org/bot${this.botToken}/setWebhook`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram webhook setup error: ${response.statusText}`);
    }
  }
}

export function formatRequestMessage(request: {
  name: string;
  phone: string;
  service: string;
  comment?: string;
}): string {
  return `
🔔 <b>Новая заявка!</b>

👤 <b>Имя:</b> ${request.name}
📞 <b>Телефон:</b> ${request.phone}
💅 <b>Услуга:</b> ${request.service}
${request.comment ? `💬 <b>Комментарий:</b> ${request.comment}` : ''}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
  `.trim();
}
