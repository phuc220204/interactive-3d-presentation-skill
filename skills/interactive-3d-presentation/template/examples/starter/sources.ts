import type { Source } from '../types';

/** Mọi tài liệu + mọi asset (ảnh, model, lottie…) đều có một mục ở đây. Xem references/assets.md. */
export const sources: Source[] = [
  {
    id: 'demo',
    kind: 'data',
    short: 'Nguồn ví dụ (2025)',
    apa: 'Tác giả/Tổ chức. (2025). Tên tài liệu [Loại tài liệu]. Nhà xuất bản. https://example.org',
    url: 'https://example.org',
  },
];
