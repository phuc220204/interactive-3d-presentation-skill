import type { DeckMeta, Slide } from '../types';

/**
 * EXAMPLE · Kinh tế / Chính trị / Môn xã hội (vi, obsidian, family data-3d)
 * Every 3D scene carries the slide's argument (globe = flows, towers = scale, network = actors…).
 * Shows: beats synced with scene state (sceneBeats), stepwise items, live citations, one hero visual per slide.
 * All figures are ILLUSTRATIVE — do not cite them.
 */
export const deck: DeckMeta = { title: 'Ai đang nắm giữ chuỗi giá trị?', brand: 'KINH TẾ · MẪU', lang: 'vi', targetMinutes: 12 };

const HN: [number, number] = [21.03, 105.85];
const TOKYO: [number, number] = [35.68, 139.69];
const SEOUL: [number, number] = [37.57, 126.98];
const SG: [number, number] = [1.35, 103.82];
const SF: [number, number] = [37.77, -122.42];

export const slides: Slide[] = [
  {
    id: 's01',
    section: 'Mở đầu',
    layout: 'cover',
    kicker: 'Kinh tế chính trị · Mẫu',
    title: 'Ai đang nắm giữ **chuỗi giá trị?**',
    lead: 'Chuỗi giá trị toàn cầu đi qua Việt Nam — nhưng phần giá trị ở lại là bao nhiêu?',
    meta: [
      { label: 'Nhóm', value: 'Nhóm 0' },
      { label: 'Lớp', value: 'XX0000' },
      { label: 'Thành viên', value: 'A · B · C · D' },
    ],
    scene: { name: 'globe', purpose: 'Địa cầu xoay về Việt Nam — đặt bài toán ở vị trí của Việt Nam trong chuỗi toàn cầu.', state: { focus: [14, 108], highlight: ['Vietnam'] } },
  },
  {
    id: 's02',
    section: 'Dòng chảy',
    title: 'Vốn và linh kiện **đổ vào**, thành phẩm **đi ra**',
    lead: 'Mỗi lần bấm thêm một dòng chảy.',
    blocks: [
      {
        type: 'list',
        style: 'numbered',
        stepwise: true,
        items: ['Đầu tư và linh kiện từ **Nhật Bản, Hàn Quốc**', 'Trung chuyển tài chính qua ==Singapore==', 'Thành phẩm xuất sang thị trường !!cuối cùng!!'],
      },
    ],
    scene: {
      name: 'globe',
      purpose: 'Các cung sáng là dòng vốn/hàng hoá; mỗi nhịp thêm một dòng đúng như danh sách bên trái.',
      state: { focus: [18, 115], points: [{ at: HN, label: 'Việt Nam', tone: 'alert' }] },
    },
    sceneBeats: [
      {},
      { arcs: [{ from: TOKYO, to: HN }, { from: SEOUL, to: HN }] },
      { arcs: [{ from: TOKYO, to: HN }, { from: SEOUL, to: HN }, { from: SG, to: HN, tone: 'cool' }] },
      { arcs: [{ from: TOKYO, to: HN }, { from: SEOUL, to: HN }, { from: SG, to: HN, tone: 'cool' }, { from: HN, to: SF, tone: 'alert' }], focus: [25, 150] },
    ],
    sources: ['demo-data'],
  },
  {
    id: 's03',
    section: 'Quy mô',
    title: 'Một tập đoàn **lớn hơn** cả một nền kinh tế',
    blocks: [
      {
        type: 'metric',
        items: [
          { value: 514.7, decimals: 1, suffix: ' tỷ USD', label: 'GDP quốc gia A (minh hoạ)', tone: 'alert', source: 'demo-data' },
          { value: 416.2, decimals: 1, suffix: ' tỷ USD', label: 'Doanh thu tập đoàn B (minh hoạ)', tone: 'accent', source: 'demo-data' },
        ],
      },
      { type: 'callout', tone: 'cool', label: 'Lưu ý', body: 'Doanh thu ≠ giá trị gia tăng — chỉ so khi cùng đơn vị, cùng năm.', beat: 1 },
    ],
    scene: {
      name: 'towers',
      purpose: 'Chiều cao cột tỷ lệ với số liệu — người xem so quy mô bằng mắt trước khi đọc số.',
      state: { unit: 'tỷ USD', items: [{ label: 'Quốc gia A', value: 514.7, display: '514,7', tone: 'alert' }, { label: 'Tập đoàn B', value: 416.2, display: '416,2', tone: 'accent' }] },
    },
    scope: 'Số liệu minh hoạ.',
  },
  {
    id: 's04',
    section: 'Mâu thuẫn',
    title: 'Lợi ích **thống nhất** nhưng phân phối !!lệch!!',
    blocks: [
      {
        type: 'compare',
        relation: 'vs',
        left: { tag: 'Thống nhất', tone: 'accent', title: 'Cùng hưởng lợi', points: ['Mở rộng **việc làm**', 'Chuyển giao một phần công nghệ'] },
        right: { tag: 'Mâu thuẫn', tone: 'alert', title: 'Phân phối lệch', points: ['Giá trị gia tăng !!thấp!!', 'Phụ thuộc linh kiện nhập'] },
        verdict: 'Thống nhất là **điều kiện**, mâu thuẫn là **động lực** — cần chính sách điều hoà lợi ích.',
      },
    ],
    scene: { name: 'morph', purpose: 'Hai khối hạt kéo về hai phía — hình ảnh của hai mặt đối lập trong cùng một quan hệ.', state: { shape: 'split' } },
  },
  {
    id: 's05',
    section: 'Các chủ thể',
    layout: 'split-right',
    title: 'Bốn chủ thể, **một** mạng lợi ích',
    blocks: [
      {
        type: 'bento',
        columns: 2,
        items: [
          { tag: 'Nhà nước', title: 'Điều tiết', body: 'Luật, thuế, chuẩn mực.', tone: 'cool', detail: 'Ví dụ chi tiết mở ra khi bấm — dùng khi hỏi đáp.' },
          { tag: 'Doanh nghiệp', title: 'Lợi nhuận', body: 'Chi phí, thị phần.', tone: 'accent' },
          { tag: 'Lao động', title: 'Thu nhập', body: 'Lương, an sinh.', tone: 'ink' },
          { tag: 'Xã hội', title: 'Minh bạch', body: 'Công bằng, niềm tin.', tone: 'alert' },
        ],
      },
    ],
    scene: {
      name: 'network',
      purpose: 'Nút là chủ thể, cạnh là quan hệ lợi ích; màu cạnh: vàng = thống nhất, đỏ = xung đột, xanh = điều tiết.',
      state: {
        nodes: [
          { id: 'nn', label: 'Nhà nước', center: true, tone: 'cool' },
          { id: 'dn', label: 'Doanh nghiệp', tone: 'accent' },
          { id: 'ld', label: 'Lao động' },
          { id: 'xh', label: 'Xã hội', tone: 'alert' },
        ],
        links: [
          { a: 'nn', b: 'dn', tone: 'cool' },
          { a: 'nn', b: 'ld', tone: 'cool' },
          { a: 'nn', b: 'xh', tone: 'cool' },
          { a: 'dn', b: 'ld', tone: 'alert' },
          { a: 'xh', b: 'dn', tone: 'alert' },
        ],
      },
    },
  },
  {
    id: 's06',
    section: 'Lộ trình',
    title: 'Bốn bước để **giữ lại** nhiều giá trị hơn',
    blocks: [
      {
        type: 'flow',
        direction: 'column',
        stepwise: true,
        beat: 0,
        steps: [
          { title: 'Gia công', body: 'Lắp ráp theo đơn hàng.' },
          { title: 'Cung ứng', body: 'Linh kiện trong nước.' },
          { title: 'Thiết kế', body: 'Làm chủ khâu sáng tạo.', tone: 'cool' },
          { title: 'Thương hiệu', body: 'Giữ phần giá trị cao nhất.', tone: 'accent' },
        ],
      },
    ],
    scene: {
      name: 'flow',
      purpose: 'Dòng hạt chạy qua bốn trạm — nhịp nào sáng trạm đó, đúng với bước đang nói.',
      state: { steps: [{ label: 'Gia công' }, { label: 'Cung ứng' }, { label: 'Thiết kế', tone: 'cool' }, { label: 'Thương hiệu', tone: 'accent' }], active: 0 },
    },
    sceneBeats: [{ active: 0 }, { active: 1 }, { active: 2 }, { active: 3 }],
  },
  {
    id: 's07',
    section: 'Kết luận',
    layout: 'center',
    kicker: 'Kết luận',
    title: 'Giá trị ở lại nhờ **năng lực**, không nhờ vị trí',
    subtitle: 'Câu hỏi cho lớp: ngành bạn học đang ở khâu nào của chuỗi?',
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Street_vendor_in_Old_Town_of_Hanoi%2C_20240204_1338_5775.jpg/1920px-Street_vendor_in_Old_Town_of_Hanoi%2C_20240204_1338_5775.jpg',
      alt: 'Người bán hàng rong ở phố cổ Hà Nội',
      sourceId: 'img-hanoi',
      opacity: 0.45,
    },
    scene: { name: 'ambient' },
  },
  { id: 's08', section: 'Tài liệu', layout: 'references', title: 'Tài liệu tham khảo', scene: { name: 'ambient' } },
];
