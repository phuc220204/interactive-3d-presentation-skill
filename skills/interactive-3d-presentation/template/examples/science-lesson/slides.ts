import type { DeckMeta, Slide } from '../types';

/**
 * EXAMPLE · Khoa học / Toán (vi, chalkboard)
 * Shows: math blocks + inline math, plot curves and a 3D surface, compare, table + line chart.
 */
export const deck: DeckMeta = { title: 'Hàm số bậc hai và đồ thị', brand: 'TOÁN 10 · MẪU', lang: 'vi', targetMinutes: 15, offline: true };

export const slides: Slide[] = [
  {
    id: 's01',
    section: 'Mở đầu',
    layout: 'cover',
    kicker: 'Toán · Bài giảng mẫu',
    title: 'Hàm số **bậc hai** và đồ thị',
    lead: 'Từ công thức $$y = ax^2 + bx + c$$ đến hình dạng parabol — và một bước nhảy sang không gian ba chiều.',
    meta: [
      { label: 'Môn', value: 'Toán' },
      { label: 'Thời lượng', value: '45 phút' },
      { label: 'Hình thức', value: 'Bài giảng + thảo luận' },
    ],
    scene: { name: 'plot', purpose: 'Đồ thị y = x² — hình dạng parabol mà cả bài sẽ phân tích.', state: { mode: 'curve', fn: 'x^2', range: [-3, 3], label: 'y = x²', tone: 'accent' } },
  },
  {
    id: 's02',
    section: 'Định nghĩa',
    title: 'Dạng **tổng quát**',
    blocks: [
      { type: 'math', tex: 'y = ax^2 + bx + c \\qquad (a \\neq 0)' },
      { type: 'list', stepwise: true, items: ['$$a > 0$$: parabol **quay lên**', '$$a < 0$$: parabol !!quay xuống!!', '$$|a|$$ càng lớn, parabol càng ==hẹp=='] },
    ],
    scene: { name: 'plot', purpose: 'Một parabol cụ thể minh hoạ dạng tổng quát.', state: { mode: 'curve', fn: '0.5*x^2 - x - 1.5', range: [-3, 5], label: 'y = ½x² − x − 1,5', tone: 'accent' } },
  },
  {
    id: 's03',
    section: 'Đỉnh',
    layout: 'split-right',
    title: 'Đỉnh và **trục đối xứng**',
    blocks: [
      { type: 'math', tex: 'x_0 = -\\frac{b}{2a}, \\qquad y_0 = -\\frac{\\Delta}{4a}', caption: 'với $$\\Delta = b^2 - 4ac$$' },
      { type: 'callout', tone: 'accent', label: 'Ví dụ', body: '$$y = x^2 - 2x - 3$$ có đỉnh tại $$(1; -4)$$ và trục đối xứng $$x = 1$$.' },
    ],
    scene: { name: 'plot', purpose: 'Đồ thị của chính ví dụ đang tính — thấy đỉnh và trục đối xứng.', state: { mode: 'curve', fn: 'x^2 - 2*x - 3', range: [-2, 4], label: 'y = x² − 2x − 3', tone: 'cool' } },
  },
  {
    id: 's04',
    section: 'Bảng giá trị',
    layout: 'grid',
    title: 'Lập **bảng giá trị** rồi vẽ',
    blocks: [
      {
        type: 'table',
        columns: ['x', '−2', '−1', '0', '1', '2', '3', '4'],
        rows: [['y = x² − 2x − 3', '5', '0', '−3', '**−4**', '−3', '0', '5']],
        highlightCol: 4,
      },
      {
        type: 'chart',
        kind: 'line',
        labels: ['−2', '−1', '0', '1', '2', '3', '4'],
        series: [{ name: 'y', values: [5, 0, -3, -4, -3, 0, 5], tone: 'accent' }],
        height: 260,
        caption: 'Đồ thị vẽ từ bảng giá trị — điểm thấp nhất là đỉnh (1; −4).',
      },
    ],
    scene: { name: 'ambient' },
  },
  {
    id: 's05',
    section: 'So sánh',
    title: 'Dấu của **a** quyết định hình dạng',
    blocks: [
      {
        type: 'compare',
        relation: 'vs',
        left: { tag: 'a > 0', tone: 'accent', title: 'Quay lên', points: ['Có giá trị **nhỏ nhất**', 'Ví dụ: $$y = x^2$$'] },
        right: { tag: 'a < 0', tone: 'alert', title: 'Quay xuống', points: ['Có giá trị !!lớn nhất!!', 'Ví dụ: $$y = -x^2 + 1$$'] },
      },
    ],
    scene: { name: 'plot', purpose: 'Parabol quay xuống khi a < 0, đặt cạnh phần so sánh.', state: { mode: 'curve', fn: '-(x^2) + 1', range: [-3, 3], label: 'y = −x² + 1', tone: 'alert' } },
  },
  {
    id: 's06',
    section: 'Mở rộng',
    title: 'Mở rộng: **mặt yên ngựa**',
    lead: 'Thêm một biến nữa, ta có mặt bậc hai trong không gian.',
    blocks: [{ type: 'math', tex: 'z = x^2 - y^2', caption: 'Theo trục x là parabol quay lên, theo trục y là parabol quay xuống.' }],
    scene: { name: 'plot', purpose: 'Mặt yên ngựa z = x² − y²: parabol quay lên theo x, quay xuống theo y.', state: { mode: 'surface', fn: '0.35*(x^2 - y^2)', range: [-2.5, 2.5], label: 'z = x² − y²', tone: 'accent' } },
  },
  { id: 's07', section: 'Tài liệu', layout: 'references', title: 'Tài liệu tham khảo', scene: { name: 'ambient' } },
];
