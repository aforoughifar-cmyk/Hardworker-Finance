export const sendMessage = async (token: string, chatId: string, text: string): Promise<void> => {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Telegram API Error');
    }
    
    console.log('Telegram message sent successfully:', data);

  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    throw error;
  }
};
