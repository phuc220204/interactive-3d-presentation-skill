import type { DeckMeta, Slide } from '../types';

/**
 * DRAFTING LESSON — ví dụ theme "drafting" (bản vẽ kỹ thuật trên giấy can) và bộ hiệu ứng 2D:
 * section opener + chuyển cảnh lau, waffle, gauge, dimension, simulation, chú thích bút tay, đường nối,
 * con dấu, máy đánh chữ, viền kiến bò, số đếm trong chữ, gear 3D, morph theo giai đoạn.
 * Số liệu là MINH HOẠ (nguồn "sample-data") — thay bằng số có nguồn khi dùng thật.
 */
export const deck: DeckMeta = { title: 'Điện mặt trời cho trường học', brand: 'BÀI MẪU · BẢN VẼ', lang: 'vi', targetMinutes: 10 };

export const slides: Slide[] = [
  {
    id: 's01',
    section: 'Mở đầu',
    layout: 'cover',
    kicker: 'Bài mẫu · Năng lượng',
    title: 'Mái trường có thể **tự làm ra điện**',
    lead: 'Một hệ thống nhỏ trên mái: tấm pin, bộ biến tần và lưới điện quay cùng một nhịp.',
    meta: [
      { label: 'Người trình bày', value: 'Lan · Minh' },
      { label: 'Thời lượng', value: '10 phút' },
    ],
    scene: { name: 'gear', anchor: [0.79, 0.5], purpose: 'Ba bánh răng ăn khớp: tấm pin, biến tần, lưới điện — một hệ thống chỉ chạy khi cả ba cùng quay.', state: { labels: ['Tấm pin', 'Biến tần', 'Lưới điện'] } },
    speaker: 'Lan',
  },
  {
    id: 's02',
    section: 'Vấn đề',
    layout: 'section',
    title: 'Điện của trường đang đi đâu?',
    subtitle: 'Phần 1 · Bức tranh tiêu thụ',
    scene: { name: 'ambient' },
    speaker: 'Lan',
  },
  {
    id: 's03',
    section: 'Vấn đề',
    title: 'Điều hoà dùng **phần lớn** điện của trường',
    lead: 'Cứ 100 kWh trường dùng thì ==62 kWh== là cho điều hoà (số minh hoạ).',
    blocks: [
      {
        type: 'waffle',
        icon: 'square',
        source: 'sample-data',
        parts: [
          { value: 62, label: 'Điều hoà', tone: 'alert' },
          { value: 23, label: 'Chiếu sáng', tone: 'accent' },
          { value: 15, label: 'Máy tính, khác', tone: 'cool' },
        ],
      },
    ],
    annotations: [{ type: 'circle', target: '62 kWh', beat: 1, note: 'trọng tâm' }],
    scene: { name: 'ambient' },
    speaker: 'Lan',
  },
  {
    id: 's04',
    section: 'Vấn đề',
    layout: 'grid',
    title: 'Mục tiêu tiết kiệm mới đi được **một nửa** chặng',
    blocks: [
      {
        type: 'gauge',
        items: [
          { value: 48, target: 100, label: 'Tiến độ mục tiêu tiết kiệm năm nay', tone: 'accent', source: 'sample-data' },
          { value: 30, target: 50, label: 'Tỉ lệ đèn đã đổi sang LED', tone: 'cool', source: 'sample-data' },
        ],
      },
      { type: 'callout', style: 'stamp', tone: 'alert', label: 'Kết luận phần 1', body: 'Cần nguồn điện mới', beat: 1 },
    ],
    scene: { name: 'ambient' },
    speaker: 'Lan',
  },
  {
    id: 's05',
    section: 'Giải pháp',
    layout: 'section',
    title: 'Tấm pin trên mái: tự trả tiền cho chính nó',
    subtitle: 'Phần 2 · Tính toán',
    scene: { name: 'ambient' },
    speaker: 'Minh',
  },
  {
    id: 's06',
    section: 'Giải pháp',
    title: 'Hoàn vốn trong ==6 năm==, dùng tới ==25 năm==',
    blocks: [
      {
        type: 'dimension',
        unit: 'năm',
        source: 'sample-data',
        items: [
          { label: 'Thời gian hoàn vốn', value: 6, tone: 'alert' },
          { label: 'Tuổi thọ tấm pin', value: 25, tone: 'accent' },
        ],
        caption: 'Hai đường vẽ cùng tỉ lệ: phần còn lại sau hoàn vốn là điện miễn phí.',
      },
    ],
    annotations: [{ type: 'arrow', target: 'Tuổi thọ tấm pin', beat: 1, note: '19 năm điện miễn phí', tone: 'accent' }],
    scene: { name: 'ambient' },
    speaker: 'Minh',
  },
  {
    id: 's07',
    section: 'Giải pháp',
    layout: 'grid',
    title: 'Điện đi từ mái xuống lớp học qua **ba chặng**',
    blocks: [
      { type: 'callout', id: 'pin', label: '1 · Tấm pin', body: 'Biến ánh nắng thành điện một chiều.', tone: 'accent' },
      { type: 'callout', id: 'inv', label: '2 · Biến tần', body: 'Đổi sang điện xoay chiều cho thiết bị dùng.', tone: 'cool', beat: 1 },
      { type: 'callout', id: 'lop', label: '3 · Lớp học', body: 'Thừa thì bán lại lưới, thiếu thì lấy từ lưới.', tone: 'ink', beat: 2 },
    ],
    connectors: [
      { from: 'pin', to: 'inv', accent: true, beat: 1 },
      { from: 'inv', to: 'lop', accent: true, beat: 2 },
    ],
    scene: { name: 'ambient' },
    speaker: 'Minh',
  },
  {
    id: 's08',
    section: 'Giải pháp',
    title: 'Thêm tấm pin, tiền điện giảm — **kéo thử**',
    lead: 'Mô hình minh hoạ: mỗi tấm 0,55 kW, khoảng 4 giờ nắng/ngày, giá 2.000 đồng/kWh.',
    blocks: [
      {
        type: 'simulation',
        input: { label: 'Số tấm pin trên mái', min: 0, max: 60, step: 1, value: 40, unit: 'tấm' },
        outputs: [
          { label: 'Điện tạo ra mỗi tháng', fn: 'x*0.55*4*30', unit: 'kWh', tone: 'accent' },
          { label: 'Tiền điện tiết kiệm mỗi tháng', fn: 'x*0.55*4*30*2000/1000000', unit: 'triệu đồng', decimals: 1, tone: 'cool' },
        ],
        autoplay: true,
        caption: 'Kéo thanh trượt khi trả lời câu hỏi "nếu chỉ lắp một nửa thì sao?"',
      },
    ],
    scene: { name: 'ambient' },
    speaker: 'Minh',
  },
  {
    id: 's09',
    section: 'Giải pháp',
    layout: 'split-right',
    title: 'Một ngôi trường, ba vai trò',
    lead: 'Từ nơi tiêu thụ điện thành nơi sản xuất, rồi thành bài học cho học sinh.',
    blocks: [{ type: 'list', style: 'numbered', stepwise: true, items: ['Nơi **dùng** điện', 'Nơi **làm ra** điện', 'Nơi **dạy** về năng lượng'] }],
    scene: {
      name: 'morph',
      purpose: 'Hạt chuyển từ ngôi nhà (nơi dùng điện) sang mũi tên đi lên (tự sản xuất) rồi con chip (đo đạc, dạy học) — đúng ba vai trò trong danh sách.',
      state: { stages: [{ shape: 'house', label: 'Dùng điện' }, { shape: 'arrow', label: 'Làm ra điện' }, { shape: 'chip', label: 'Dạy học' }], stageSeconds: 5 },
    },
    // last beat: all three roles side by side (2×2 summary grid with arrows)
    sceneBeats: [{}, {}, {}, {}, { summary: true }],
    speaker: 'Minh',
  },
  {
    id: 's10',
    section: 'Kết luận',
    layout: 'center',
    title: 'Mái nhà là tài sản **chưa dùng tới**',
    blocks: [{ type: 'quote', text: 'Mỗi mét vuông mái nắng là một mét vuông điện.', author: 'Câu chốt của bài', typing: true }],
    scene: { name: 'ambient' },
    speaker: 'Minh',
  },
  {
    id: 's11',
    section: 'Kết luận',
    layout: 'center',
    title: 'Trường bạn có bao nhiêu mét vuông mái nắng?',
    blocks: [{ type: 'callout', style: 'ants', label: 'Câu hỏi mở', body: 'Ước lượng diện tích mái rồi thử lại mô hình ở slide 8.' }],
    scene: { name: 'ambient' },
    speaker: 'Minh',
  },
  { id: 's12', section: 'Tài liệu', layout: 'references', title: 'Nguồn', scene: { name: 'ambient' } },
];
