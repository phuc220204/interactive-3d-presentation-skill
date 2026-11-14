import type { DeckMeta, Slide } from '../types';

/**
 * EXAMPLE · Du lịch / Địa lí (vi, sketchbook)
 * Shows: globe route, parallax of layered 2D assets, 3D photo gallery, gallery block, area chart,
 * cards (ticket / map / note), glTF model with hotspots.
 * Content is a sample to demonstrate the template — numbers marked "minh hoạ" are not real data.
 */
export const deck: DeckMeta = { title: 'Hội An — phố cổ bên dòng Hoài', brand: 'DU LỊCH · MẪU', lang: 'vi', targetMinutes: 8 };

const HN: [number, number] = [21.03, 105.85];
const DN: [number, number] = [16.05, 108.2];
const HA: [number, number] = [15.88, 108.33];
const route = [
  { at: HN, label: 'Hà Nội' },
  { at: DN, label: 'Đà Nẵng' },
  { at: HA, label: 'Hội An' },
];

const IMG = {
  bridge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2024_H%E1%BB%99i_An_-_Japanese_Covered_Bridge_%28Ch%C3%B9a_C%E1%BA%A7u%29_after_renovation_-_img_11.jpg/1280px-2024_H%E1%BB%99i_An_-_Japanese_Covered_Bridge_%28Ch%C3%B9a_C%E1%BA%A7u%29_after_renovation_-_img_11.jpg',
  bridge2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/H%E1%BB%99i_An%2C_Ch%C3%B9a_C%E1%BA%A7u%2C_2020-01_CN-03.jpg/1280px-H%E1%BB%99i_An%2C_Ch%C3%B9a_C%E1%BA%A7u%2C_2020-01_CN-03.jpg',
  lanterns2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Lanterns_in_Hoi_An_2.jpg/1280px-Lanterns_in_Hoi_An_2.jpg',
  lanterns3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Lanterns_in_Hoi_An_3.jpg/1280px-Lanterns_in_Hoi_An_3.jpg',
  lanterns5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Lanterns_in_Hoi_An_5.jpg/1280px-Lanterns_in_Hoi_An_5.jpg',
};

export const slides: Slide[] = [
  {
    id: 's01',
    section: 'Mở đầu',
    layout: 'cover',
    kicker: 'Du lịch · Địa lí · Mẫu',
    title: 'Hội An — phố cổ **bên dòng Hoài**',
    lead: 'Một hành trình ba ngày từ Hà Nội vào miền Trung: phố đèn lồng, chùa Cầu và những con đường gạch cũ.',
    meta: [
      { label: 'Chủ đề', value: 'Du lịch văn hoá' },
      { label: 'Thời lượng', value: '3 ngày' },
      { label: 'Lộ trình', value: 'Hà Nội → Đà Nẵng → Hội An' },
    ],
    scene: { name: 'globe', purpose: 'Địa cầu xoay về miền Trung Việt Nam — nơi hành trình diễn ra; Việt Nam tô nổi để thấy ngay vị trí.', state: { route, active: 0, highlight: ['Vietnam'], zoom: 1.6 } },
  },
  {
    id: 's02',
    section: 'Lộ trình',
    title: 'Ba điểm dừng, **một** hành trình',
    lead: 'Mỗi lần bấm đi thêm một chặng: cung sáng là chặng đã đi, điểm đỏ là nơi đang dừng.',
    blocks: [
      {
        type: 'timeline',
        stepwise: true,
        beat: 0,
        active: 2,
        items: [
          { date: 'Ngày 0', title: 'Hà Nội', body: 'Bay vào Đà Nẵng.' },
          { date: 'Ngày 1', title: 'Đà Nẵng', body: 'Di chuyển ~30 km.' },
          { date: 'Ngày 1–3', title: 'Hội An', body: 'Phố cổ, làng nghề, biển.', tone: 'accent' },
        ],
      },
    ],
    scene: { name: 'globe', purpose: 'Lộ trình đánh số trên địa cầu; mỗi nhịp globe quay tới điểm dừng tiếp theo, khớp với dòng thời gian.', state: { route, active: 0 } },
    sceneBeats: [{ active: 0 }, { active: 1 }, { active: 2 }],
  },
  {
    id: 's03',
    section: 'Phố đèn lồng',
    layout: 'split-right',
    title: 'Phố **đèn lồng** về đêm',
    lead: 'Cảnh “parallax”: ảnh nền + hai lớp hình 2D tách nền (mái nhà, dây đèn) đặt ở các độ sâu khác nhau — rê chuột để thấy chiều sâu.',
    blocks: [{ type: 'list', style: 'check', items: ['Đi dạo phố cổ khi lên đèn', 'Thả đèn hoa đăng trên sông', 'Thưởng thức ẩm thực đường phố'] }],
    scene: {
      name: 'parallax',
      purpose: 'Ảnh thật + hai lớp hình 2D ở các độ sâu khác nhau dựng lại cảm giác đứng giữa phố đèn lồng.',
      state: {
        layers: [
          { src: IMG.lanterns2, depth: 0, scale: 1.25 },
          { src: '/assets/parallax/rooftops.svg', depth: 0.5, y: -1.1, scale: 1.05 },
          { src: '/assets/parallax/lanterns.svg', depth: 0.95, y: 0.9, scale: 1.1 },
        ],
      },
    },
    sources: ['img-lanterns'],
  },
  {
    id: 's04',
    section: 'Hình ảnh',
    layout: 'grid',
    title: 'Những khung hình **Hội An**',
    blocks: [
      {
        type: 'gallery',
        columns: 4,
        items: [
          { src: IMG.bridge, alt: 'Chùa Cầu sau trùng tu', caption: 'Chùa Cầu (2024)', credit: 'Chainwit · CC BY 4.0' },
          { src: IMG.bridge2, alt: 'Chùa Cầu nhìn từ phố', caption: 'Chùa Cầu (2020)', credit: 'S. Schmitz · CC BY-SA 4.0' },
          { src: IMG.lanterns3, alt: 'Đèn lồng Hội An', caption: 'Đèn lồng lụa', credit: 'Christophe95 · CC BY-SA 4.0' },
          { src: IMG.lanterns5, alt: 'Cửa hàng đèn lồng', caption: 'Cửa hàng đèn', credit: 'Christophe95 · CC BY-SA 4.0' },
        ],
      },
    ],
    scene: { name: 'ambient' },
    sources: ['img-bridge-2024', 'img-bridge-2020', 'img-lanterns'],
  },
  {
    id: 's05',
    section: 'Mùa đẹp',
    title: 'Nên đi **mùa nào?**',
    blocks: [
      {
        type: 'chart',
        kind: 'area',
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        series: [{ name: 'Mức độ đông khách (minh hoạ)', values: [55, 70, 72, 78, 74, 80, 86, 84, 60, 40, 38, 50], tone: 'accent' }],
        height: 280,
        caption: 'Số liệu minh hoạ cho bộ khung — không phải thống kê thật.',
      },
    ],
    scene: { name: 'ambient' },
    scope: 'Biểu đồ minh hoạ.',
  },
  {
    id: 's06',
    section: 'Chuẩn bị',
    title: 'Trước khi **lên đường**',
    blocks: [{ type: 'list', style: 'numbered', items: ['Đặt vé và chỗ ở sớm vào mùa cao điểm', 'Mang áo mưa nhẹ vào mùa mưa (khoảng T9–T12)', 'Mua vé tham quan phố cổ tại các điểm bán'] }],
    scene: { name: 'cards', purpose: 'Vé, bản đồ và lịch trình bay quanh — ba thứ cần chuẩn bị, đúng với danh sách.', state: { cards: [{ kind: 'ticket', label: 'Hà Nội → Đà Nẵng' }, { kind: 'map', label: 'Bản đồ phố cổ', tone: 'alert' }, { kind: 'note', label: 'Lịch trình 3 ngày' }] } },
  },
  {
    id: 's07',
    section: 'Mô hình 3D',
    title: 'Ánh đèn **phố cũ**',
    lead: 'Cảnh “model”: tải một mô hình glTF/GLB (ở đây: đèn đường cổ, CC0) — tự căn giữa, xoay chậm, có nhãn điểm.',
    blocks: [{ type: 'callout', label: 'Mẹo', body: 'Dùng mô hình 3D cho hiện vật lịch sử, công trình, phân tử hay sản phẩm.' }],
    scene: {
      name: 'model',
      purpose: 'Mô hình đèn đường cổ xoay chậm để nhìn chi tiết chất liệu — nhãn chỉ đúng phần đang nói.',
      state: {
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb',
        hotspots: [
          { at: [0.55, 0.62, 0], label: 'Chụp đèn' },
          { at: [-0.2, -0.95, 0], label: 'Cột gỗ' },
        ],
      },
    },
    camera: { sequence: 'quanh-den', duration: 6 },
    sources: ['model-lantern'],
  },
  { id: 's08', section: 'Tài liệu', layout: 'references', title: 'Nguồn ảnh & tư liệu', scene: { name: 'ambient' } },
];
