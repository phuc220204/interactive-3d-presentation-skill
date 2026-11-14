import { deck } from './content/slides';

/**
 * UI strings. The deck's language comes from `deck.lang` ('vi' | 'en'); any single string can be
 * overridden with `deck.labels.<key>`. Add a language by adding a column here.
 */
const STRINGS = {
  vi: {
    scope: 'Giới hạn',
    sources: 'Nguồn',
    references: 'Tài liệu tham khảo',
    images: 'Nguồn hình ảnh & tư liệu',
    notes: 'Ghi chú thuyết trình',
    noNotes: 'Chưa có ghi chú cho slide này',
    next: 'Tiếp theo',
    end: '— Hết —',
    close: 'Đóng',
    overview: 'Tổng quan',
    overviewClose: 'Esc / O để đóng',
    help: 'Phím tắt',
    presenterHint: '← → điều khiển deck chính',
    'key.next': 'Nhịp / slide tiếp',
    'key.prev': 'Nhịp / slide trước',
    'key.click': 'Click: tiếp · Shift+click / chuột phải: lùi',
    'key.cite': 'Soi mọi chỗ có nguồn',
    'key.timer': 'Bắt đầu / đặt lại đồng hồ',
    'key.ends': 'Đầu / cuối',
    'key.overview': 'Tổng quan — nhảy nhanh',
    'key.notes': 'Ghi chú thuyết trình',
    'key.presenter': 'Cửa sổ người trình bày (đồng bộ)',
    'key.fullscreen': 'Toàn màn hình',
    'key.theme': 'Đổi theme (chỉ khi phát triển)',
    'key.wheel': 'Chuyển slide',
    'key.esc': 'Đóng mọi bảng',
    effects: 'Hiệu ứng',
    model: 'Mô hình 3D',
    play: 'Phát video',
    beat: 'Nhịp',
    source: 'Nguồn',
    openSource: 'Mở nguồn',
    aiAsset: 'Minh hoạ tạo bởi AI',
    secondary: 'DẪN LẠI',
    planned: 'dự kiến',
    look: 'Đổi sáng / tối',
    userAsset: 'Ảnh do tác giả cung cấp',
  },
  en: {
    scope: 'Scope',
    sources: 'Sources',
    references: 'References',
    images: 'Image & media credits',
    notes: 'Speaker notes',
    noNotes: 'No notes for this slide',
    next: 'Next',
    end: '— End —',
    close: 'Close',
    overview: 'Overview',
    overviewClose: 'Esc / O to close',
    help: 'Shortcuts',
    presenterHint: '← → drive the main deck',
    'key.next': 'Next beat / slide',
    'key.prev': 'Previous beat / slide',
    'key.click': 'Click: next · Shift+click / right click: back',
    'key.cite': 'Highlight every cited item',
    'key.timer': 'Start / reset the timer',
    'key.ends': 'First / last',
    'key.overview': 'Overview — jump anywhere',
    'key.notes': 'Speaker notes',
    'key.presenter': 'Presenter window (synced)',
    'key.fullscreen': 'Fullscreen',
    'key.theme': 'Cycle theme (development only)',
    'key.wheel': 'Change slide',
    'key.esc': 'Close panels',
    effects: 'Effects',
    model: '3D model',
    play: 'Play video',
    beat: 'Beat',
    source: 'Source',
    openSource: 'Open source',
    aiAsset: 'AI-generated illustration',
    secondary: 'SECONDARY',
    planned: 'planned',
    look: 'Light / dark',
    userAsset: 'Provided by the author',
  },
} as const;

export type Lang = keyof typeof STRINGS;
export type StringKey = keyof (typeof STRINGS)['vi'];

export const lang: Lang = (deck.lang ?? 'vi') in STRINGS ? ((deck.lang ?? 'vi') as Lang) : 'en';
export const locale = deck.locale ?? (lang === 'vi' ? 'vi-VN' : 'en-US');

export function t(key: StringKey): string {
  const o = deck.labels as Partial<Record<string, string>> | undefined;
  return o?.[key] ?? STRINGS[lang][key];
}
