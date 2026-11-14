import type { Source } from '../types';

export const sources: Source[] = [
  {
    id: 'demo-data',
    kind: 'data',
    short: 'Dữ liệu minh hoạ (2026)',
    apa: 'Dữ liệu minh hoạ. (2026). Số liệu giả lập để trình diễn bộ khung. Không dùng để trích dẫn.',
  },
  {
    id: 'img-hanoi',
    kind: 'photo',
    license: 'CC BY 4.0',
    short: 'Hałun (2024)',
    apa: 'Hałun, J. (2024). Street vendor in Old Town of Hanoi [Ảnh]. Wikimedia Commons. https://commons.wikimedia.org/wiki/File:Street_vendor_in_Old_Town_of_Hanoi,_20240204_1338_5775.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Street_vendor_in_Old_Town_of_Hanoi,_20240204_1338_5775.jpg',
    assets: ['https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Street_vendor_in_Old_Town_of_Hanoi'],
  },
];
