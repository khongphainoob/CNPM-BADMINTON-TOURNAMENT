/**
 * Remove Vietnamese diacritics and convert to URL-safe slug.
 * "Giải Cầu Lông Toàn Quốc 2026" → "giai-cau-long-toan-quoc-2026"
 */
export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
