import type { DeckMeta, Slide } from '../types';

/**
 * EXAMPLE · Lịch sử / Văn hoá / Nghệ thuật (vi, ivory)
 * Shows: 3D gallery wall of artworks (cover), flow, gallery block with lightbox, bento, gallery stack,
 * duotone photo backdrop on a statement slide, timeline.
 * Sample content for the template — verify facts against your own sources before presenting.
 */
export const deck: DeckMeta = { title: 'Tranh dân gian Đông Hồ', brand: 'VĂN HOÁ · MẪU', lang: 'vi', targetMinutes: 10 };

const P = {
  nhanNghia: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Dong_Ho_painting_-_Nhan_nghia.jpg',
  daiCat: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Dong_Ho_painting_-_Dai_cat.jpg',
  lyNgu: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Dong_Ho_painting_-_Ly_Ngu_vong_nguyet.jpg',
  mucDong: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Dong_Ho_painting_-_Muc_dong_doc_sach.jpg',
  ongTao: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Tranh_%C4%90%C3%B4ng_H%E1%BB%93_%C3%94ng_T%C3%A1o.jpg',
};

export const slides: Slide[] = [
  {
    id: 's01',
    section: 'Mở đầu',
    layout: 'cover',
    kicker: 'Văn hoá · Nghệ thuật · Mẫu',
    title: 'Tranh dân gian **Đông Hồ**',
    lead: 'Dòng tranh khắc gỗ in trên giấy điệp — những lời chúc Tết bằng màu sắc thiên nhiên.',
    meta: [
      { label: 'Chủ đề', value: 'Mỹ thuật dân gian' },
      { label: 'Nơi', value: 'Làng Đông Hồ, Bắc Ninh' },
      { label: 'Kỹ thuật', value: 'In ván khắc gỗ' },
    ],
    scene: {
      name: 'gallery',
      purpose: 'Ba bức tranh treo như trong phòng trưng bày — người xem thấy ngay chất liệu và màu trước khi nghe giải thích.',
      state: {
        arrangement: 'arc',
        focus: 1,
        items: [
          { src: P.daiCat, label: 'Đại cát' },
          { src: P.lyNgu, label: 'Lý ngư vọng nguyệt' },
          { src: P.mucDong, label: 'Mục đồng đọc sách' },
        ],
      },
    },
    sources: ['img-dongho'],
  },
  {
    id: 's02',
    section: 'Kỹ thuật',
    title: 'Từ **ván khắc** đến giấy điệp',
    lead: 'Mỗi màu được in bằng một ván khắc riêng, lần lượt chồng lên nhau.',
    blocks: [
      {
        type: 'flow',
        direction: 'column',
        stepwise: true,
        beat: 0,
        steps: [
          { title: 'Khắc ván', body: 'Ván nét và ván màu riêng.' },
          { title: 'Chuẩn bị màu', body: 'Màu từ vật liệu tự nhiên.' },
          { title: 'In từng lớp', body: 'Mỗi lớp một màu.', tone: 'cool' },
          { title: 'Phơi khô', body: 'Hoàn thiện bức tranh.', tone: 'accent' },
        ],
      },
    ],
    scene: { name: 'flow', purpose: 'Bốn trạm của quy trình in; nhịp nào sáng trạm đó.', state: { steps: [{ label: 'Khắc ván' }, { label: 'Màu' }, { label: 'In', tone: 'cool' }, { label: 'Phơi', tone: 'accent' }], active: 0 } },
    sceneBeats: [{ active: 0 }, { active: 1 }, { active: 2 }, { active: 3 }],
  },
  {
    id: 's03',
    section: 'Tác phẩm',
    layout: 'grid',
    title: 'Bốn bức tranh **tiêu biểu**',
    blocks: [
      {
        type: 'gallery',
        columns: 4,
        ratio: '3 / 4',
        items: [
          { src: P.nhanNghia, alt: 'Tranh Nhân nghĩa', caption: 'Nhân nghĩa', credit: 'Public domain' },
          { src: P.daiCat, alt: 'Tranh Đại cát', caption: 'Đại cát', credit: 'Public domain' },
          { src: P.lyNgu, alt: 'Tranh Lý ngư vọng nguyệt', caption: 'Lý ngư vọng nguyệt', credit: 'Public domain' },
          { src: P.mucDong, alt: 'Tranh Mục đồng đọc sách', caption: 'Mục đồng đọc sách', credit: 'Public domain' },
        ],
      },
    ],
    scene: { name: 'ambient' },
    sources: ['img-dongho'],
  },
  {
    id: 's04',
    section: 'Màu sắc',
    layout: 'split-right',
    title: 'Bảng màu **từ thiên nhiên**',
    blocks: [
      {
        type: 'bento',
        columns: 2,
        items: [
          { tag: 'Đen', title: 'Than lá tre', body: 'Nét viền, chữ.', tone: 'ink' },
          { tag: 'Đỏ', title: 'Sỏi son', body: 'Sắc ấm, may mắn.', tone: 'alert' },
          { tag: 'Vàng', title: 'Hoa hoè', body: 'Sáng, rực rỡ.', tone: 'accent' },
          { tag: 'Nền', title: 'Giấy điệp', body: 'Ánh vỏ sò lấp lánh.', tone: 'cool' },
        ],
      },
    ],
    scene: {
      name: 'gallery',
      purpose: 'Chồng tranh đặt cạnh bảng màu để đối chiếu từng màu với bức tranh thật.',
      scale: 1.6,
      state: { arrangement: 'stack', focus: 1, items: [{ src: P.nhanNghia }, { src: P.daiCat, label: 'Đại cát' }, { src: P.ongTao }] },
    },
    scope: 'Nội dung mẫu — đối chiếu nguồn chuyên khảo trước khi trình bày.',
  },
  {
    id: 's05',
    section: 'Ý nghĩa',
    layout: 'center',
    kicker: 'Ý nghĩa',
    title: 'Mỗi bức tranh là **một lời chúc** năm mới',
    subtitle: 'Sung túc · đỗ đạt · hiếu nghĩa · bình an',
    image: { src: P.lyNgu, alt: 'Tranh Lý ngư vọng nguyệt', sourceId: 'img-dongho', opacity: 0.45 },
    scene: { name: 'ambient' },
    sources: ['img-dongho'],
  },
  {
    id: 's06',
    section: 'Bảo tồn',
    layout: 'grid',
    title: 'Giữ nghề trong **đời sống hôm nay**',
    blocks: [
      {
        type: 'timeline',
        active: 3,
        items: [
          { date: 'Xưa', title: 'Tranh Tết', body: 'Bán trong dịp Tết.' },
          { date: 'Biến đổi', title: 'Thu hẹp', body: '!!Ít hộ còn làm nghề!!.', tone: 'alert' },
          { date: 'Gần đây', title: 'Ghi nhận', body: 'Được quan tâm bảo tồn.' },
          { date: 'Hôm nay', title: 'Sáng tạo mới', body: 'Quà tặng, thiết kế, trải nghiệm.', tone: 'accent' },
        ],
      },
    ],
    scene: { name: 'timeline', purpose: 'Trục thời gian xoắn đưa mốc đang nói ra phía trước.', state: { items: [{ label: 'Xưa' }, { label: 'Biến đổi', tone: 'alert' }, { label: 'Gần đây' }, { label: 'Hôm nay', tone: 'accent' }], active: 3 } },
    scope: 'Mốc khái quát cho ví dụ.',
  },
  { id: 's07', section: 'Tài liệu', layout: 'references', title: 'Nguồn ảnh', scene: { name: 'ambient' } },
];
