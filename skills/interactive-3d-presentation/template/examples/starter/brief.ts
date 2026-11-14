import type { Brief } from '../types';

/**
 * BRIEF — điều user đã chốt ở bước 0 (references/brief-intake.md). Validator đối chiếu deck với brief:
 * một theme, một họ hiệu ứng (scenes), mức chuyển động.
 */
export const brief: Brief = {
  purpose: 'Bài thuyết trình môn học 10 phút',
  audience: 'Giảng viên và lớp',
  minutes: 10,
  lang: 'vi',
  theme: 'obsidian',
  family: 'data-3d',
  scenes: ['morph', 'towers'],
  imagery: ['diagram'],
  motion: 'standard',
  interaction: ['keys', 'click', 'wheel', 'clicker', 'presenter-window'],
  offline: false,
};
