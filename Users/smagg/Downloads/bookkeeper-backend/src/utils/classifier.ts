import { CATEGORY_KEYWORDS } from './keyword';
import { fetchFromHuggingFace } from './huggingFaceAPI';
import UnclassifiedNote from '../models/UnclassifiedNote';

/**
 * 將 AI 回傳的類別標準化對應成你系統內部的分類名稱
 */
function mapToCategory(raw: string): string {
  const normalized = raw.trim().toLowerCase();

  const mapping: Record<string, string> = {
    '餐飲': '餐飲',
    '飲食': '餐飲',
    '用餐': '餐飲',
    '交通': '交通',
    '娛樂': '娛樂',
    '遊戲': '娛樂',
    '日用品': '日用品',
    '醫療': '醫療',
    '看病': '醫療',
    '教育': '教育',
    '學習': '教育',
    '旅遊': '旅遊',
    '出遊': '旅遊',
    '投資': '投資',
    '股票': '投資',
    '服飾': '服飾',
    '衣服': '服飾',
    '寵物': '寵物',
    '家庭': '家庭',
    '其他': '其他'
  };

  for (const [key, mapped] of Object.entries(mapping)) {
    if (normalized.includes(key)) return mapped;
  }

  return '其他';
}

/**
 * 主分類邏輯
 */
export async function getCategory(note: string): Promise<{ category: string, source: 'local' | 'huggingface' | 'unknown' }> {
  if (!note) return { category: '其他', source: 'local' };

  const normalized = note.toLowerCase().replace(/\s+/g, '').replace(/[^\w\u4e00-\u9fa5]/g, '');

  // 本地分類邏輯（keyword match）
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const keywordNormalized = keyword.toLowerCase().replace(/\s+/g, '');
      if (normalized.includes(keywordNormalized)) {
        return { category, source: 'local' };
      }
    }
  }

  // 本地無命中，使用 AI 模型判斷
  try {
    const aiCategory = await fetchFromHuggingFace(note);
    const mapped = mapToCategory(aiCategory || '');

    // 若 AI 也分類為 "其他"，記錄下來
    if (mapped === '其他') {
      await UnclassifiedNote.create({ note });
      return { category: mapped, source: 'unknown' };
    }

    return { category: mapped, source: 'huggingface' };
  } catch (err) {
    console.error('AI 分類失敗:', err);
    await UnclassifiedNote.create({ note });
    return { category: '其他', source: 'unknown' };
  }
}
