// utils/keywordFallback.ts
const CATEGORY_KEYWORDS: Record<string, string> = {
  '麥當勞': '飲食',
  '星巴克': '飲食',
  '捷運': '交通',
  'Uber': '交通',
  '電影院': '娛樂',
  '7-11': '飲食',
};

export function matchLocalCategory(note: string): string | null {
  for (const keyword in CATEGORY_KEYWORDS) {
    if (note.includes(keyword)) {
      return CATEGORY_KEYWORDS[keyword];
    }
  }
  return null;
}
