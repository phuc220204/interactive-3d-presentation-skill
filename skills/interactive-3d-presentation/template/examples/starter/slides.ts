import type { DeckMeta, Slide } from '../types';

/**
 * STARTER — the default content. Replace every slide with the user's content (keep their order and wording).
 * It shows the authoring pattern: one idea + one hero visual per slide, a `purpose` for every 3D scene,
 * beats (nhịp) for step-by-step reveal, and live citations [text](^sourceId).
 */
export const deck: DeckMeta = { title: 'Tên bài thuyết trình', brand: 'NHÓM · MÔN', lang: 'vi', targetMinutes: 10 };

export const slides: Slide[] = [
  {
    id: 's01',
    section: 'Mở đầu',
    layout: 'cover',
    kicker: 'Môn học · Chủ đề',
    title: 'Một câu khẳng định làm **luận điểm** của bài',
    lead: 'Một câu giới thiệu ngắn: bài này trả lời câu hỏi gì, cho ai.',
    meta: [
      { label: 'Nhóm', value: 'Tên nhóm' },
      { label: 'Người trình bày', value: 'A · B · C' },
      { label: 'Ngày', value: 'dd/mm/yyyy' },
    ],
    scene: { name: 'morph', state: { shape: 'converge' }, purpose: 'Nhiều hạt hội tụ thành một khối — bài đi từ nhiều dữ kiện đến một luận điểm.' },
    speaker: 'A',
  },
  {
    id: 's02',
    section: 'Câu hỏi',
    title: 'Bài trả lời **ba câu hỏi**',
    lead: 'Mỗi lần bấm (→, Space, click hoặc bút trình chiếu) hiện thêm một câu hỏi.',
    blocks: [
      {
        type: 'list',
        style: 'numbered',
        stepwise: true,
        beat: 0,
        items: ['Câu hỏi thứ nhất?', 'Câu hỏi thứ hai?', 'Câu hỏi thứ ba?'],
      },
    ],
    scene: { name: 'ambient' },
    speaker: 'A',
  },
  {
    id: 's03',
    section: 'Số liệu',
    title: 'Một con số **đổi cách nhìn** vấn đề',
    lead: 'Số có gạch chấm là số có nguồn — bấm để mở nguồn, nhấn K để soi tất cả.',
    blocks: [
      {
        type: 'metric',
        items: [
          { value: 42, suffix: '%', label: 'Chỉ số A năm 2025 (ví dụ)', tone: 'alert', source: 'demo' },
          { value: 58, suffix: '%', label: 'Chỉ số B năm 2025 (ví dụ)', tone: 'accent', source: 'demo' },
        ],
      },
    ],
    scene: {
      name: 'towers',
      purpose: 'Hai cột cao tương ứng hai chỉ số để người xem thấy chênh lệch ngay.',
      state: { unit: '%', items: [{ label: 'Chỉ số A', value: 42, display: '42%', tone: 'alert' }, { label: 'Chỉ số B', value: 58, display: '58%', tone: 'accent' }] },
    },
    scope: 'Số liệu ví dụ — thay bằng số có nguồn thật.',
    speaker: 'B',
  },
  {
    id: 's04',
    section: 'Diễn biến',
    layout: 'grid',
    title: 'Ba mốc làm nên **bước ngoặt**',
    blocks: [
      {
        type: 'timeline',
        stepwise: true,
        beat: 0,
        active: 2,
        items: [
          { date: 'Mốc 1', title: 'Khởi đầu', body: 'Một dòng mô tả ngắn.' },
          { date: 'Mốc 2', title: 'Chuyển biến', body: 'Một dòng mô tả ngắn.' },
          { date: 'Mốc 3', title: 'Bước ngoặt', body: 'Một dòng mô tả ngắn.', tone: 'accent' },
        ],
      },
    ],
    scene: { name: 'ambient' },
    speaker: 'B',
  },
  {
    id: 's05',
    section: 'Kết luận',
    layout: 'center',
    kicker: 'Kết luận',
    title: 'Câu chốt quay về **luận điểm** của bài',
    subtitle: 'Câu hỏi thảo luận cho người nghe?',
    scene: { name: 'ambient' },
    speaker: 'C',
  },
  { id: 's06', section: 'Tài liệu', layout: 'references', title: 'Tài liệu tham khảo', scene: { name: 'ambient' }, speaker: 'C' },
];
