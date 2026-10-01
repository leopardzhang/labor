/**
 * 首次启动时写入的演示数据
 */

const photo = (prompt) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=portrait_4_3`

const PHOTO = {
  worker1: photo(
    'selfie photo of a young Chinese male construction worker wearing yellow safety helmet and orange reflective safety vest at a building construction site, scaffolding in background, morning sunlight, realistic smartphone photo'
  ),
  worker2: photo(
    'selfie photo of a Chinese female construction worker wearing red safety helmet and reflective vest at construction site, concrete structure in background, realistic smartphone photo'
  ),
  worker3: photo(
    'selfie of a middle aged Chinese construction worker wearing yellow hard hat and blue work clothes, stacked steel rebar in background, realistic smartphone photo'
  ),
  worker4: photo(
    'selfie of a Chinese male construction worker in blue safety helmet at a high-rise construction site, tower crane in background, realistic smartphone photo'
  ),
}

export const seedSites = [
  {
    id: 'site-demo-001',
    name: '北京国贸 CBD 核心区在建项目',
    address: '北京市朝阳区建国门外大街 1 号附近',
    remark: '主体结构施工阶段，东门为指定打卡通道。',
    checkers: [
      { id: 'chk-001-1', name: '周建国', phone: '13800001111' },
      { id: 'chk-001-2', name: '马晓芸', phone: '13800002222' },
    ],
    polygon: [
      [116.4585, 39.9075],
      [116.4635, 39.9078],
      [116.4640, 39.9120],
      [116.4588, 39.9123],
    ],
    createdAt: '2026-09-20 09:30:00',
  },
  {
    id: 'site-demo-002',
    name: '上海张江科学城研发楼项目',
    address: '上海市浦东新区张江高科技园区博云路附近',
    remark: '',
    checkers: [{ id: 'chk-002-1', name: '林志成', phone: '13900003333' }],
    polygon: [
      [121.5870, 31.2030],
      [121.5935, 31.2032],
      [121.5940, 31.2078],
      [121.5875, 31.2080],
    ],
    createdAt: '2026-09-22 14:10:00',
  },
  {
    id: 'site-demo-003',
    name: '广州珠江新城商业综合体项目',
    address: '广州市天河区珠江新城华夏路附近',
    remark: '南区基坑作业人员重点考勤。',
    checkers: [
      { id: 'chk-003-1', name: '黄伟强', phone: '13700004444' },
      { id: 'chk-003-2', name: '吴静', phone: '13700005555' },
    ],
    polygon: [
      [113.3220, 23.1160],
      [113.3285, 23.1162],
      [113.3290, 23.1205],
      [113.3225, 23.1208],
    ],
    createdAt: '2026-09-25 08:45:00',
  },
]

export const seedRecords = [
  {
    id: 'rec-demo-001',
    siteId: 'site-demo-001',
    name: '赵磊',
    gender: '男',
    idCard: '110108199707076710',
    team: '木工班',
    lng: 116.461,
    lat: 39.9098,
    address: '北京市朝阳区建国门外大街附近（工地东门）',
    photo: PHOTO.worker1,
    time: '2026-09-30 07:42:15',
    createdAt: '2026-09-30 07:42:15',
  },
  {
    id: 'rec-demo-002',
    siteId: 'site-demo-001',
    name: '孙丽',
    gender: '女',
    idCard: '11010219900126882X',
    team: '钢筋班',
    lng: 116.4595,
    lat: 39.911,
    address: '北京市朝阳区国贸三期施工通道',
    photo: PHOTO.worker2,
    time: '2026-09-30 07:48:03',
    createdAt: '2026-09-30 07:48:03',
  },
  {
    id: 'rec-demo-003',
    siteId: 'site-demo-001',
    name: '张伟',
    gender: '男',
    idCard: '110105199203154317',
    team: '木工班',
    lng: 116.4705,
    lat: 39.915,
    address: '北京市朝阳区光华路 SOHO 附近',
    photo: PHOTO.worker3,
    time: '2026-09-30 12:20:41',
    createdAt: '2026-09-30 12:20:41',
  },
  {
    id: 'rec-demo-004',
    siteId: 'site-demo-002',
    name: '王芳',
    gender: '女',
    idCard: '310115199508226428',
    team: '钢筋班',
    lng: 121.59,
    lat: 31.2055,
    address: '上海市浦东新区张江高科技园区内',
    photo: PHOTO.worker4,
    time: '2026-09-29 07:35:22',
    createdAt: '2026-09-29 07:35:22',
  },
  {
    id: 'rec-demo-005',
    siteId: 'site-demo-002',
    name: '李强',
    gender: '男',
    idCard: '310104198811053214',
    team: '混凝土班',
    lng: 121.5925,
    lat: 31.204,
    address: '上海市浦东新区博云路工地北门',
    photo: PHOTO.worker1,
    time: '2026-09-29 18:02:57',
    createdAt: '2026-09-29 18:02:57',
  },
  {
    id: 'rec-demo-006',
    siteId: 'site-demo-003',
    name: '陈建军',
    gender: '男',
    idCard: '440103197912301539',
    team: '水电班',
    lng: 113.3255,
    lat: 23.118,
    address: '广州市天河区华夏路施工围挡内',
    photo: PHOTO.worker3,
    time: '2026-09-28 07:12:08',
    createdAt: '2026-09-28 07:12:08',
  },
  {
    id: 'rec-demo-007',
    siteId: 'site-demo-003',
    name: '刘秀英',
    gender: '女',
    idCard: '440106198506182446',
    team: '架子班',
    lng: 113.3275,
    lat: 23.1195,
    address: '广州市天河区珠江新城工地南区',
    photo: PHOTO.worker2,
    time: '2026-09-28 07:26:33',
    createdAt: '2026-09-28 07:26:33',
  },
]
