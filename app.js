/**
 * 眠境 App Logic v2
 * 100款声音 · 分类浏览 · 搜索 · 混音台 · 呼吸 · 定时器
 */

/* ════════════════════════════════════════
   100款声音分类数据
════════════════════════════════════════ */
const CATEGORIES = [
  {
    id: 'rain', name: '雨声', emoji: '🌧',
    bg: 'linear-gradient(135deg,#1a3a5c,#0d1b2a)',
    sounds: [
      { id:'rain-light',    name:'小雨',   emoji:'🌦', desc:'细如牛毛的轻柔雨丝' },
      { id:'rain-medium',   name:'中雨',   emoji:'🌧', desc:'淅淅沥沥，最治愈的雨声' },
      { id:'rain-heavy',    name:'大雨',   emoji:'🌨', desc:'倾盆而下，淋漓酣畅' },
      { id:'rain-storm',    name:'暴雨',   emoji:'⛈', desc:'风雨交加，电闪雷鸣' },
      { id:'rain-thunder',  name:'雷雨',   emoji:'🌩', desc:'低沉雷声与连绵雨丝' },
      { id:'rain-drip',     name:'屋檐滴水',emoji:'💧', desc:'雨后屋檐，一滴一滴' },
      { id:'rain-window',   name:'雨打窗',  emoji:'🪟', desc:'打在玻璃上的沙沙声' },
      { id:'rain-tropical', name:'热带雨',  emoji:'🌴', desc:'热带丛林的倾盆暴雨' },
      { id:'rain-mountain', name:'山雨',    emoji:'⛰', desc:'山间雨夜，清凉入骨' },
      { id:'rain-umbrella', name:'雨打伞',  emoji:'☂', desc:'撑伞而行，密集鼓点' },
      { id:'rain-afterrain',name:'雨后',    emoji:'🌈', desc:'雨停后偶尔的水滴声' },
      { id:'rain-sleet',    name:'冰雨',    emoji:'🌨', desc:'冰冷颗粒打在地面' },
    ]
  },
  {
    id: 'water', name: '水声', emoji: '💧',
    bg: 'linear-gradient(135deg,#0c2461,#1e3799)',
    sounds: [
      { id:'water-ocean',     name:'海浪',   emoji:'🌊', desc:'潮起潮落，随波入眠' },
      { id:'water-shore',     name:'海岸',   emoji:'🏖', desc:'浪花轻抚沙滩的声音' },
      { id:'water-stream',    name:'溪流',   emoji:'🏞', desc:'山间清澈的潺潺溪流' },
      { id:'water-waterfall', name:'瀑布',   emoji:'🌊', desc:'飞流直下的澎湃水声' },
      { id:'water-brook',     name:'小溪',   emoji:'🌿', desc:'浅浅溪流流过石头' },
      { id:'water-lake',      name:'湖面',   emoji:'🏔', desc:'平静湖面的轻柔波纹' },
      { id:'water-drops',     name:'水滴',   emoji:'💦', desc:'叮咚水滴，清脆悦耳' },
      { id:'water-hotspring', name:'温泉',   emoji:'♨', desc:'咕嘟咕嘟的温热泡泉' },
      { id:'water-fountain',  name:'喷泉',   emoji:'⛲', desc:'喷涌而出的清泉声' },
      { id:'water-pipe',      name:'水管',   emoji:'🚿', desc:'稳定流淌的水管声' },
    ]
  },
  {
    id: 'wind', name: '风声', emoji: '💨',
    bg: 'linear-gradient(135deg,#1c2833,#0d1b22)',
    sounds: [
      { id:'wind-gentle',   name:'微风',   emoji:'🍃', desc:'轻柔拂面，如呼吸般自然' },
      { id:'wind-gust',     name:'阵风',   emoji:'💨', desc:'间歇性的阵阵强风' },
      { id:'wind-tunnel',   name:'风洞',   emoji:'🌀', desc:'穿越狭长风道的呼啸' },
      { id:'wind-north',    name:'北风',   emoji:'❄', desc:'凛冽刺骨的北方寒风' },
      { id:'wind-bamboo',   name:'竹林风', emoji:'🎋', desc:'竹叶沙沙，悠然自得' },
      { id:'wind-desert',   name:'沙漠风', emoji:'🏜', desc:'广袤沙漠中的风吟' },
      { id:'wind-mountain', name:'高山风', emoji:'🏔', desc:'山顶呼啸而过的劲风' },
      { id:'wind-sea',      name:'海风',   emoji:'⛵', desc:'带着海盐味的温柔海风' },
    ]
  },
  {
    id: 'nature', name: '自然', emoji: '🌿',
    bg: 'linear-gradient(135deg,#1a3a1a,#0d2310)',
    sounds: [
      { id:'nature-forest',   name:'森林',   emoji:'🌲', desc:'鸟鸣阵阵，微风拂林' },
      { id:'nature-birds',    name:'群鸟',   emoji:'🐦', desc:'百鸟齐鸣的清晨合唱' },
      { id:'nature-night',    name:'夜虫',   emoji:'🌙', desc:'蟋蟀蛙鸣的夏夜静谧' },
      { id:'nature-cicadas',  name:'蝉鸣',   emoji:'🌞', desc:'夏日烈烈的蝉声交响' },
      { id:'nature-owl',      name:'猫头鹰', emoji:'🦉', desc:'夜幕中低沉的鸮鸣' },
      { id:'nature-frogs',    name:'青蛙',   emoji:'🐸', desc:'稻田边呱呱的蛙鸣' },
      { id:'nature-crickets', name:'蟋蟀',   emoji:'🦗', desc:'窗外细碎的蟋蟀声' },
      { id:'nature-bees',     name:'蜜蜂',   emoji:'🐝', desc:'花丛中嗡嗡的蜂鸣' },
      { id:'nature-morning',  name:'清晨鸟鸣',emoji:'🌅', desc:'黎明破晓时的鸟语花香' },
      { id:'nature-jungle',   name:'热带丛林',emoji:'🦜', desc:'生机勃勃的热带雨林' },
    ]
  },
  {
    id: 'fire', name: '火焰', emoji: '🔥',
    bg: 'linear-gradient(135deg,#4a1000,#1a0800)',
    sounds: [
      { id:'fire-campfire',  name:'篝火',   emoji:'🔥', desc:'噼啪作响，温暖慵懒' },
      { id:'fire-fireplace', name:'壁炉',   emoji:'🏠', desc:'温暖室内的炉火声' },
      { id:'fire-candle',    name:'蜡烛',   emoji:'🕯', desc:'细微跳动的烛火声' },
      { id:'fire-woodstove', name:'柴火炉', emoji:'🪵', desc:'农家灶台的劈柴燃烧' },
      { id:'fire-charcoal',  name:'炭火',   emoji:'♨', desc:'通红炭火的嗞嗞声' },
      { id:'fire-bonfire',   name:'大篝火', emoji:'🌋', desc:'节日狂欢的熊熊篝火' },
    ]
  },
  {
    id: 'room', name: '环境', emoji: '🏙',
    bg: 'linear-gradient(135deg,#2c1a0e,#1a0f08)',
    sounds: [
      { id:'room-cafe',      name:'咖啡馆', emoji:'☕', desc:'人声鼎沸的温暖角落' },
      { id:'room-library',   name:'图书馆', emoji:'📚', desc:'翻书声与安静的底噪' },
      { id:'room-office',    name:'办公室', emoji:'💻', desc:'键盘敲击与空调白噪' },
      { id:'room-restaurant',name:'餐厅',   emoji:'🍽', desc:'热闹喧嚣的就餐环境' },
      { id:'room-market',    name:'集市',   emoji:'🛒', desc:'嘈杂而充满活力的市集' },
      { id:'room-classroom', name:'教室',   emoji:'🏫', desc:'学生低语与粉笔声' },
      { id:'room-citynight', name:'城市夜晚',emoji:'🌃', desc:'灯火通明的夜晚低鸣' },
      { id:'room-temple',    name:'禅寺',   emoji:'⛩', desc:'古刹静谧的晨钟余韵' },
      { id:'room-church',    name:'教堂',   emoji:'⛪', desc:'穹顶之下的庄重共鸣' },
      { id:'room-empty',     name:'空房间', emoji:'🚪', desc:'空旷房间的细微回音' },
    ]
  },
  {
    id: 'noise', name: '噪音', emoji: '〰',
    bg: 'linear-gradient(135deg,#2a2a3a,#16161e)',
    sounds: [
      { id:'noise-white',  name:'白噪音', emoji:'⬜', desc:'平稳全频，屏蔽杂音' },
      { id:'noise-pink',   name:'粉噪音', emoji:'🌸', desc:'柔和自然，集中注意力' },
      { id:'noise-brown',  name:'棕噪音', emoji:'🟤', desc:'低频深沉，深度放松' },
      { id:'noise-blue',   name:'蓝噪音', emoji:'🔵', desc:'清脆高频，提升清醒度' },
      { id:'noise-violet', name:'紫噪音', emoji:'🟣', desc:'超高频，极度专注' },
      { id:'noise-grey',   name:'灰噪音', emoji:'⬛', desc:'心理中性，均衡舒适' },
      { id:'noise-green',  name:'绿噪音', emoji:'🟢', desc:'自然中频，仿佛置身户外' },
      { id:'noise-fan',    name:'风扇声', emoji:'🌀', desc:'电风扇的稳定嗡嗡声' },
    ]
  },
  {
    id: 'binaural', name: '双耳节拍', emoji: '🎧',
    bg: 'linear-gradient(135deg,#160a28,#0a0518)',
    sounds: [
      { id:'binaural-delta1',  name:'δ深睡1Hz',  emoji:'🌑', desc:'最深沉睡眠 · 1Hz节拍（戴耳机）' },
      { id:'binaural-delta2',  name:'δ深睡2Hz',  emoji:'🌒', desc:'深度睡眠 · 2Hz节拍（戴耳机）' },
      { id:'binaural-theta4',  name:'θ入睡4Hz',  emoji:'🌓', desc:'睡眠过渡 · 4Hz节拍（戴耳机）' },
      { id:'binaural-theta6',  name:'θ冥想6Hz',  emoji:'🌔', desc:'浅睡冥想 · 6Hz节拍（戴耳机）' },
      { id:'binaural-alpha8',  name:'α放松8Hz',  emoji:'🌕', desc:'放松状态 · 8Hz节拍（戴耳机）' },
      { id:'binaural-alpha10', name:'α清醒10Hz', emoji:'✨', desc:'清醒放松 · 10Hz节拍（戴耳机）' },
      { id:'binaural-beta14',  name:'β专注14Hz', emoji:'⚡', desc:'专注学习 · 14Hz节拍（戴耳机）' },
      { id:'binaural-gamma40', name:'γ高效40Hz', emoji:'🔮', desc:'高效思考 · 40Hz节拍（戴耳机）' },
    ]
  },
  {
    id: 'tone', name: '音调冥想', emoji: '🎵',
    bg: 'linear-gradient(135deg,#0a2820,#051810)',
    sounds: [
      { id:'tone-432',      name:'432Hz疗愈',  emoji:'🎶', desc:'宇宙频率，心灵共鸣' },
      { id:'tone-528',      name:'528Hz修复',  emoji:'💫', desc:'DNA修复频率，爱的音调' },
      { id:'tone-639',      name:'639Hz和谐',  emoji:'☯', desc:'促进关系和谐的频率' },
      { id:'tone-741',      name:'741Hz直觉',  emoji:'🔮', desc:'清洁净化，开启直觉' },
      { id:'tone-om',       name:'OM冥想音',   emoji:'🕉', desc:'梵唱共鸣，万物之源' },
      { id:'tone-bowl432',  name:'颂钵432Hz',  emoji:'🪘', desc:'432Hz唱钵循环敲击' },
      { id:'tone-bowl528',  name:'颂钵528Hz',  emoji:'🔔', desc:'528Hz唱钵疗愈共鸣' },
      { id:'tone-crystal',  name:'水晶钵',     emoji:'🔮', desc:'纯净水晶钵的泛音' },
      { id:'tone-windchime',name:'风铃',        emoji:'🎐', desc:'随风而动的清脆风铃' },
      { id:'tone-piano',    name:'钢琴低鸣',   emoji:'🎹', desc:'轻柔的环境钢琴音' },
    ]
  },
  {
    id: 'mech', name: '机械交通', emoji: '🚂',
    bg: 'linear-gradient(135deg,#1a1a2e,#0d0d1a)',
    sounds: [
      { id:'mech-train',    name:'火车',   emoji:'🚂', desc:'铁轨上的稳定轰鸣声' },
      { id:'mech-subway',   name:'地铁',   emoji:'🚇', desc:'地下穿行的列车声' },
      { id:'mech-airplane', name:'飞机舱', emoji:'✈', desc:'飞机发动机的白噪音' },
      { id:'mech-car',      name:'行驶中的车',emoji:'🚗', desc:'公路上的引擎与轮胎声' },
      { id:'mech-engine',   name:'引擎声', emoji:'⚙', desc:'低频引擎的稳定共鸣' },
      { id:'mech-spaceship',name:'宇宙飞船',emoji:'🛸', desc:'星际飞行的科幻引擎声' },
    ]
  },
  {
    id: 'env', name: '特殊环境', emoji: '🌌',
    bg: 'linear-gradient(135deg,#0a1628,#050c18)',
    sounds: [
      { id:'env-cave',        name:'山洞',    emoji:'🕳', desc:'幽深山洞的回响共鸣' },
      { id:'env-underwater',  name:'水下',    emoji:'🐠', desc:'宁静的深海之声' },
      { id:'env-space',       name:'深空',    emoji:'🌌', desc:'无垠宇宙的虚空之声' },
      { id:'env-spacestation',name:'太空站',  emoji:'🛸', desc:'太空站的机械运转声' },
      { id:'env-basement',    name:'地下室',  emoji:'🏚', desc:'静谧地下室的沉闷底噪' },
      { id:'env-desert',      name:'沙漠',    emoji:'🏜', desc:'空旷沙漠的呼啸风声' },
      { id:'env-snowstorm',   name:'暴雪',    emoji:'❄', desc:'凛冽暴雪的呼号声' },
      { id:'env-aurora',      name:'极光之夜',emoji:'🌌', desc:'北极静谧夜的神秘低鸣' },
      { id:'env-ancient-forest',name:'远古森林',emoji:'🌳', desc:'亿年森林的古老声响' },
      { id:'env-dream',       name:'梦境',    emoji:'💭', desc:'如梦似幻的飘渺音调' },
    ]
  },
];

// 扁平化全部声音
const ALL_SOUNDS = CATEGORIES.flatMap(cat =>
  cat.sounds.map(s => ({ ...s, category: cat.id, categoryName: cat.name, categoryBg: cat.bg }))
);

/* ════════════════════════════════════════
   呼吸模式
════════════════════════════════════════ */
const BREATHE_MODES = [
  { id:'4-7-8',  name:'4-7-8',   desc:'经典助眠', inhale:4, hold:7, exhale:8 },
  { id:'box',    name:'箱式呼吸', desc:'专注减压', inhale:4, hold:4, exhale:4 },
  { id:'5-5',    name:'5-5节奏', desc:'日常放松', inhale:5, hold:0, exhale:5 },
  { id:'6-2-8',  name:'6-2-8',   desc:'深度放松', inhale:6, hold:2, exhale:8 },
];

const TIMER_PRESETS = [15, 30, 45, 60, 90];

/* ════════════════════════════════════════
   State
════════════════════════════════════════ */
const state = {
  currentPage: 'home-page',
  activeSounds: {},
  mixerVolumes: {},

  currentCategory: 'all',
  searchQuery: '',

  breatheMode: '4-7-8',
  breatheRunning: false,
  breatheTimers: [],

  timerMinutes: 30,
  timerSeconds: 0,
  timerTotal: 0,
  timerInterval: null,
  timerRunning: false,
  fadeDuration: 2,
};

/* ════════════════════════════════════════
   Utils
════════════════════════════════════════ */
const $ = id => document.getElementById(id);

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tmr);
  t._tmr = setTimeout(() => t.classList.remove('show'), 2200);
}

function formatTime(sec) {
  return `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;
}

/* ════════════════════════════════════════
   Page Navigation
════════════════════════════════════════ */
function navigateTo(pageId) {
  if (state.currentPage === pageId) return;
  document.querySelector('.page.active')?.classList.remove('active');
  document.getElementById(pageId)?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === pageId));
  state.currentPage = pageId;
  // 切到混音台时刷新
  if (pageId === 'mixer-page') refreshMixerActive();
}
document.querySelectorAll('.nav-btn').forEach(b =>
  b.addEventListener('click', () => navigateTo(b.dataset.page)));

/* ════════════════════════════════════════
   Ambient Background
════════════════════════════════════════ */
function updateAmbientBg(soundId) {
  const sound = ALL_SOUNDS.find(s => s.id === soundId);
  if (!sound) return;
  $('ambient-bg').style.background = sound.categoryBg +
    ', radial-gradient(ellipse at 80% 80%, rgba(0,0,0,0.5), transparent)';
}

/* ════════════════════════════════════════
   Mini Player
════════════════════════════════════════ */
function updateMiniPlayer() {
  const player = $('mini-player');
  const ids = Object.keys(state.activeSounds);
  if (ids.length === 0) { player.classList.remove('visible'); return; }
  player.classList.add('visible');
  const primary = ALL_SOUNDS.find(s => s.id === ids[0]);
  if (primary) {
    $('mini-player-icon').textContent = primary.emoji;
    $('mini-player-name').textContent = ids.length > 1
      ? `${primary.name} + ${ids.length-1} 个声音` : primary.name;
    $('mini-player-sub').textContent = '正在播放';
  }
}

$('mini-play-btn').addEventListener('click', () => {
  const ids = Object.keys(state.activeSounds);
  if (!ids.length) return;
  const svg = $('mini-play-btn').querySelector('svg');
  if (window.audioEngine.anyPlaying()) {
    ids.forEach(id => window.audioEngine.stop(id));
    svg.innerHTML = '<path d="M8 5v14l11-7z" fill="currentColor"/>';
    $('mini-player-sub').textContent = '已暂停';
  } else {
    ids.forEach(id => window.audioEngine.play(id, state.activeSounds[id]));
    svg.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    $('mini-player-sub').textContent = '正在播放';
  }
});
$('mini-vol-slider').addEventListener('input', e =>
  window.audioEngine.setMasterVolume(e.target.value / 100));

/* ════════════════════════════════════════
   HOME PAGE
════════════════════════════════════════ */
function buildHome() {
  buildCategoryTabs();
  renderSoundGrid();
}

function buildCategoryTabs() {
  const wrap = $('category-tabs');
  wrap.innerHTML = '';

  // "全部" tab
  const allTab = document.createElement('button');
  allTab.className = 'cat-tab active';
  allTab.textContent = '全部';
  allTab.dataset.cat = 'all';
  allTab.addEventListener('click', () => selectCategory('all', allTab));
  wrap.appendChild(allTab);

  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab';
    btn.innerHTML = `${cat.emoji} ${cat.name}`;
    btn.dataset.cat = cat.id;
    btn.addEventListener('click', () => selectCategory(cat.id, btn));
    wrap.appendChild(btn);
  });
}

function selectCategory(catId, btnEl) {
  state.currentCategory = catId;
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
  renderSoundGrid();
}

function renderSoundGrid() {
  const grid = $('sound-grid');
  grid.innerHTML = '';

  let sounds = ALL_SOUNDS;
  if (state.currentCategory !== 'all') {
    sounds = sounds.filter(s => s.category === state.currentCategory);
  }
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    sounds = sounds.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.categoryName.toLowerCase().includes(q)
    );
  }

  if (sounds.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-dim)">没有找到相关声音</div>';
    return;
  }

  sounds.forEach(sound => {
    const card = document.createElement('div');
    card.className = `scene-card${state.activeSounds[sound.id] !== undefined ? ' playing' : ''}`;
    card.id = `scene-card-${sound.id}`;
    card.innerHTML = `
      <div class="sc-bg" style="background:${sound.categoryBg}"></div>
      <div class="sc-overlay"></div>
      <div class="sc-content">
        <div class="sc-emoji">${sound.emoji}</div>
        <div class="sc-name">${sound.name}</div>
      </div>
    `;
    card.addEventListener('click', () => toggleSound(sound.id));
    grid.appendChild(card);
  });
}

/* ════════════════════════════════════════
   Sound Toggle
════════════════════════════════════════ */
function toggleSound(id) {
  if (state.activeSounds[id] !== undefined) {
    window.audioEngine.stop(id);
    delete state.activeSounds[id];
    document.getElementById(`scene-card-${id}`)?.classList.remove('playing');
    refreshMixerActive();
  } else {
    const vol = state.mixerVolumes[id] ?? 0.7;
    state.activeSounds[id] = vol;
    window.audioEngine.play(id, vol);
    document.getElementById(`scene-card-${id}`)?.classList.add('playing');
    updateAmbientBg(id);
    refreshMixerActive();
    const s = ALL_SOUNDS.find(x => x.id === id);
    showToast(`${s?.emoji} ${s?.name} 开始播放`);
  }
  updateMiniPlayer();
}

/* ════════════════════════════════════════
   MIXER PAGE
════════════════════════════════════════ */
function buildMixer() {
  const list = $('mixer-list');
  list.innerHTML = '';

  // 分类标题 + 声音列表
  CATEGORIES.forEach(cat => {
    const header = document.createElement('div');
    header.style.cssText = 'padding:16px 0 8px;font-size:13px;color:var(--text-dim);font-weight:600;letter-spacing:.5px;';
    header.textContent = `${cat.emoji} ${cat.name}`;
    list.appendChild(header);

    cat.sounds.forEach(sound => {
      const isActive = state.activeSounds[sound.id] !== undefined;
      const vol = state.mixerVolumes[sound.id] ?? 0.7;

      const item = document.createElement('div');
      item.className = `mixer-item${isActive ? ' active' : ''}`;
      item.id = `mixer-${sound.id}`;
      item.innerHTML = `
        <div class="mixer-icon" style="background:${cat.bg}">${sound.emoji}</div>
        <div class="mixer-info" style="flex:1">
          <div class="mixer-name">${sound.name}</div>
          <div class="mixer-desc">${sound.desc}</div>
          <div class="mixer-vol${isActive ? '' : ' mixer-vol-hidden'}">
            <input class="vol-slider" id="mvol-${sound.id}" type="range" min="0" max="100" value="${Math.round(vol*100)}"/>
            <span class="vol-label" id="mvol-lbl-${sound.id}">${Math.round(vol*100)}</span>
          </div>
        </div>
        <button class="mixer-toggle" id="mtog-${sound.id}"></button>
      `;

      item.querySelector(`#mtog-${sound.id}`).addEventListener('click', () => toggleSound(sound.id));
      item.querySelector(`#mvol-${sound.id}`).addEventListener('input', e => {
        const v = e.target.value / 100;
        state.mixerVolumes[sound.id] = v;
        $(`mvol-lbl-${sound.id}`).textContent = e.target.value;
        if (state.activeSounds[sound.id] !== undefined) {
          state.activeSounds[sound.id] = v;
          window.audioEngine.setVolume(sound.id, v);
        }
      });

      list.appendChild(item);
    });
  });
}

function refreshMixerActive() {
  ALL_SOUNDS.forEach(({ id }) => {
    const item = $(`mixer-${id}`);
    if (!item) return;
    const isActive = state.activeSounds[id] !== undefined;
    item.classList.toggle('active', isActive);
    const volWrap = item.querySelector('.mixer-vol');
    if (volWrap) volWrap.classList.toggle('mixer-vol-hidden', !isActive);
  });
}

/* ════════════════════════════════════════
   BREATHE PAGE
════════════════════════════════════════ */
function buildBreatheModes() {
  const grid = $('breathe-mode-grid');
  grid.innerHTML = '';
  BREATHE_MODES.forEach(mode => {
    const btn = document.createElement('button');
    btn.className = `breathe-mode-btn${state.breatheMode === mode.id ? ' selected' : ''}`;
    btn.dataset.mode = mode.id;
    btn.innerHTML = `<div class="bm-name">${mode.name}</div><div class="bm-desc">${mode.desc}</div>`;
    btn.addEventListener('click', () => {
      if (state.breatheRunning) stopBreathe();
      state.breatheMode = mode.id;
      document.querySelectorAll('.breathe-mode-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      resetBreatheUI();
    });
    grid.appendChild(btn);
  });
}

function resetBreatheUI() {
  $('breathe-phase').textContent = '准备好了吗';
  $('breathe-count').textContent = '—';
  $('breathe-start-btn').textContent = '开始呼吸';
  $('breathe-circle').className = 'breathe-circle';
  state.breatheRunning = false;
}

function startBreathe() {
  const mode = BREATHE_MODES.find(m => m.id === state.breatheMode);
  state.breatheRunning = true;
  $('breathe-start-btn').textContent = '停止';

  const phases = [
    { label:'吸气', duration:mode.inhale, cls:'inhale' },
    ...(mode.hold > 0 ? [{ label:'屏息', duration:mode.hold, cls:'hold' }] : []),
    { label:'呼气', duration:mode.exhale, cls:'exhale' },
  ];

  let phaseIdx = 0;

  const clearAll = () => {
    state.breatheTimers.forEach(clearInterval);
    state.breatheTimers = [];
  };

  let countdown = 3;
  $('breathe-phase').textContent = '即将开始';
  $('breathe-count').textContent = countdown;

  const startT = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(startT);
      runPhase();
    } else {
      $('breathe-count').textContent = countdown;
    }
  }, 1000);
  state.breatheTimers.push(startT);

  function runPhase() {
    if (!state.breatheRunning) return;
    const ph = phases[phaseIdx];
    $('breathe-phase').textContent = ph.label;
    $('breathe-circle').className = 'breathe-circle ' + ph.cls;
    let cnt = ph.duration;
    $('breathe-count').textContent = cnt;

    const iv = setInterval(() => {
      cnt--;
      if (cnt <= 0) {
        clearInterval(iv);
        phaseIdx = (phaseIdx + 1) % phases.length;
        setTimeout(runPhase, 150);
      } else {
        $('breathe-count').textContent = cnt;
      }
    }, 1000);
    state.breatheTimers.push(iv);
  }
}

function stopBreathe() {
  state.breatheTimers.forEach(t => clearInterval(t));
  state.breatheTimers = [];
  resetBreatheUI();
}

$('breathe-start-btn').addEventListener('click', () => {
  state.breatheRunning ? stopBreathe() : startBreathe();
});

/* ════════════════════════════════════════
   TIMER PAGE
════════════════════════════════════════ */
function initTimerPage() {
  const container = $('timer-presets');
  TIMER_PRESETS.forEach(min => {
    const btn = document.createElement('button');
    btn.className = `timer-preset${state.timerMinutes === min ? ' selected' : ''}`;
    btn.textContent = `${min} 分钟`;
    btn.dataset.min = min;
    btn.addEventListener('click', () => {
      if (state.timerRunning) return;
      state.timerMinutes = min;
      $('timer-custom-input').value = '';
      document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      updateTimerDisplay(min * 60);
    });
    container.appendChild(btn);
  });

  $('timer-custom-input').addEventListener('input', e => {
    const v = parseInt(e.target.value);
    if (v > 0 && v <= 480) {
      state.timerMinutes = v;
      document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('selected'));
      updateTimerDisplay(v * 60);
    }
  });

  $('fade-duration-slider').addEventListener('input', e => {
    state.fadeDuration = parseInt(e.target.value);
    $('fade-label-val').textContent = state.fadeDuration === 0 ? '关闭' : `${state.fadeDuration} 分钟`;
  });

  $('timer-start-btn').addEventListener('click', () => {
    state.timerRunning ? stopTimer() : startTimer();
  });
  $('timer-reset-btn').addEventListener('click', stopTimer);

  const circ = 2 * Math.PI * 104;
  $('timer-progress').style.strokeDasharray = circ;
  $('timer-progress').style.strokeDashoffset = circ;
  updateTimerDisplay(state.timerMinutes * 60);
}

function updateTimerDisplay(sec) {
  $('timer-display').textContent = formatTime(sec);
  const circ = 2 * Math.PI * 104;
  const total = state.timerRunning ? state.timerTotal : sec;
  const offset = total > 0 ? circ * (1 - sec / total) : circ;
  $('timer-progress').style.strokeDashoffset = offset;
  if (!state.timerRunning) $('timer-label').textContent = '未开始';
}

function startTimer() {
  if (!window.audioEngine.anyPlaying()) { showToast('请先选择一个声音场景'); return; }
  state.timerTotal = state.timerMinutes * 60;
  state.timerSeconds = state.timerTotal;
  state.timerRunning = true;
  $('timer-start-btn').textContent = '停止定时';
  $('timer-start-btn').style.background = 'rgba(255,80,80,.8)';
  $('timer-label').textContent = '倒计时中';

  state.timerInterval = setInterval(() => {
    state.timerSeconds--;
    updateTimerDisplay(state.timerSeconds);
    const fadeSec = state.fadeDuration * 60;
    if (state.timerSeconds === fadeSec && fadeSec > 0) {
      window.audioEngine.fadeOutAll(fadeSec);
      showToast(`声音将在 ${state.fadeDuration} 分钟内渐弱`);
    }
    if (state.timerSeconds <= 0) {
      clearInterval(state.timerInterval);
      window.audioEngine.stopAll(2);
      Object.keys(state.activeSounds).forEach(id => {
        delete state.activeSounds[id];
        document.getElementById(`scene-card-${id}`)?.classList.remove('playing');
      });
      updateMiniPlayer();
      refreshMixerActive();
      resetTimer();
      showToast('定时结束，晚安 🌙');
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  state.timerRunning = false;
  $('timer-start-btn').textContent = '开始定时';
  $('timer-start-btn').style.background = '';
  $('timer-label').textContent = '未开始';
  updateTimerDisplay(state.timerMinutes * 60);
  const circ = 2 * Math.PI * 104;
  $('timer-progress').style.strokeDashoffset = circ;
}
const resetTimer = stopTimer;

/* ════════════════════════════════════════
   PWA & Wake Lock
════════════════════════════════════════ */
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}

let wakeLock = null;
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch(e) {}
  }
}
document.addEventListener('visibilitychange', () => {
  if (wakeLock !== null && document.visibilityState === 'visible') requestWakeLock();
});

/* ════════════════════════════════════════
   Search
════════════════════════════════════════ */
$('search-input').addEventListener('input', e => {
  state.searchQuery = e.target.value.trim();
  if (state.searchQuery) {
    // 搜索时切到全部类别
    state.currentCategory = 'all';
    document.querySelectorAll('.cat-tab').forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));
  }
  renderSoundGrid();
});

/* ════════════════════════════════════════
   Stats badge
════════════════════════════════════════ */
function updateStats() {
  const el = $('sound-count-badge');
  if (el) el.textContent = `${ALL_SOUNDS.length} 款声音`;
}

/* ════════════════════════════════════════
   Init
════════════════════════════════════════ */
function init() {
  // 初始化所有声音的混音台音量
  ALL_SOUNDS.forEach(s => { state.mixerVolumes[s.id] = 0.7; });

  buildHome();
  buildMixer();
  buildBreatheModes();
  initTimerPage();
  registerSW();
  updateStats();

  // 首次点击请求 Wake Lock
  document.addEventListener('click', () => {
    if (window.audioEngine.anyPlaying()) requestWakeLock();
  }, { once: true });
}

document.addEventListener('DOMContentLoaded', init);
