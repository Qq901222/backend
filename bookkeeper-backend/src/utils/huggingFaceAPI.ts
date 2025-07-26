import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/deepseek-ai/deepseek-llm-7b-chat';

export async function fetchFromHuggingFace(note: string): Promise<string | null> {
  try {
    const response = await axios.post(
      HF_MODEL_URL,
      {
        inputs: `請判斷以下句子屬於哪一類別：\n\n「${note}」\n\n常見類別：餐飲、交通、娛樂、日用品、醫療、教育、旅遊、投資、服飾、寵物、家庭等，只需回傳其中一個分類。`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        },
        timeout: 10000,
      }
    );

    const result = response.data;
    const label = typeof result === 'string'
      ? result
      : result?.[0]?.generated_text || '';

    return label?.trim() || null;
  } catch (err) {
    console.error('HuggingFace API 錯誤:', err);
    return null;
  }
}
