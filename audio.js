/**
 * 眠境 Audio Engine v2
 * 参数驱动合成架构 — 支持100种环境声
 * 所有声音由 Web Audio API 实时生成，无需外部音频文件
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sources = {};
    this.masterVol = 0.7;
  }

  _ensureCtx() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.masterVol;
    this.masterGain.connect(this.ctx.destination);
  }

  /* ──────────────────────────────
     基础噪声缓冲区生成
  ────────────────────────────── */
  _noiseBuffer(sec = 3, type = 'white') {
    const len = this.ctx.sampleRate * sec;
    const buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      if (type === 'white') {
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } else if (type === 'pink') {
        let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
          b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
          b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
          d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
        }
      } else if (type === 'brown') {
        let last = 0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          d[i] = (last + 0.02 * w) / 1.02; last = d[i]; d[i] *= 3.5;
        }
      } else if (type === 'blue') {
        let prev = 0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          d[i] = w - prev; prev = w;
          d[i] *= 0.5;
        }
      } else if (type === 'violet') {
        let prev = 0, prev2 = 0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          d[i] = w - 2*prev + prev2; prev2 = prev; prev = w;
          d[i] *= 0.25;
        }
      }
    }
    return buf;
  }

  _loopNoise(type = 'white') {
    const buf = this._noiseBuffer(4, type);
    const src = this.ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    return src;
  }

  _filter(type, freq, Q = 1) {
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq;
    if (Q) f.Q.value = Q;
    return f;
  }

  _gain(val) {
    const g = this.ctx.createGain();
    g.gain.value = val;
    return g;
  }

  _osc(type, freq) {
    const o = this.ctx.createOscillator();
    o.type = type; o.frequency.value = freq;
    return o;
  }

  /* ══════════════════════════════════════
     合成器类型 — 参数驱动
  ══════════════════════════════════════ */

  /** 纯噪声变体 */
  _synth_noise({ noiseType='white', filterType=null, freq=1000, Q=1, gain=0.5 }) {
    const mg = this._gain(gain); mg.connect(this.masterGain);
    const src = this._loopNoise(noiseType);
    if (filterType) {
      const f = this._filter(filterType, freq, Q);
      src.connect(f); f.connect(mg);
    } else { src.connect(mg); }
    src.start();
    return { nodes: [src], gainNode: mg };
  }

  /** 雨声变体 */
  _synth_rain({ hp=1200, lp=8000, baseGain=0.55, dropRate=0.15, dropFreqMin=800, dropFreqMax=3000, thunderGain=0, wind=false, vol=0.6 }) {
    const mg = this._gain(vol); mg.connect(this.masterGain);
    const nodes = [];

    // 主雨声噪音
    const src = this._loopNoise('white');
    const hpf = this._filter('highpass', hp, 0.5);
    const lpf = this._filter('lowpass', lp);
    const rg = this._gain(baseGain);
    src.connect(hpf); hpf.connect(lpf); lpf.connect(rg); rg.connect(mg);
    src.start(); nodes.push(src);

    // 低频雷声/共鸣
    if (thunderGain > 0) {
      const ts = this._loopNoise('brown');
      const tf = this._filter('lowpass', 200);
      const tg = this._gain(thunderGain);
      ts.connect(tf); tf.connect(tg); tg.connect(mg);
      ts.start(); nodes.push(ts);
    }

    // 风混入
    if (wind) {
      const ws = this._loopNoise('pink');
      const wbp = this._filter('bandpass', 400, 0.6);
      const wg = this._gain(0.12);
      ws.connect(wbp); wbp.connect(wg); wg.connect(mg);
      ws.start(); nodes.push(ws);
    }

    // 水滴声
    const drop = () => {
      if (!this.sources[this._currentId]?.playing) return;
      const delay = (0.02 + Math.random() * dropRate) * 1000;
      const o = this._osc('sine', dropFreqMin + Math.random() * (dropFreqMax - dropFreqMin));
      const e = this._gain(0); e.connect(mg);
      const t = this.ctx.currentTime;
      e.gain.setValueAtTime(0, t);
      e.gain.linearRampToValueAtTime(0.018 + Math.random()*0.015, t + 0.002);
      e.gain.exponentialRampToValueAtTime(0.0001, t + 0.06 + Math.random()*0.05);
      o.connect(e); o.start(t); o.stop(t + 0.12);
      setTimeout(drop, delay);
    };
    setTimeout(drop, 300);

    return { nodes, gainNode: mg, external: true };
  }

  /** 水流声变体 */
  _synth_water({ noiseType='pink', lpFreq=2000, bpFreq=0, Q=0.8, gain=0.55, waveFreq=0, waveMod=0, vol=0.6 }) {
    const mg = this._gain(vol); mg.connect(this.masterGain);
    const nodes = [];
    const src = this._loopNoise(noiseType);

    const lp = this._filter('lowpass', lpFreq);
    let last = lp;
    if (bpFreq > 0) {
      const bp = this._filter('bandpass', bpFreq, Q);
      lp.connect(bp); last = bp;
    }
    const g = this._gain(gain);
    src.connect(lp); last.connect(g); g.connect(mg);
    src.start(); nodes.push(src);

    if (waveFreq > 0) {
      // 周期波浪调制
      const buf = this._noiseBuffer(4, 'pink');
      const src2 = this.ctx.createBufferSource();
      src2.buffer = buf; src2.loop = true;
      const lp2 = this._filter('lowpass', lpFreq * 1.5);
      const wg = this._gain(0);
      const curve = new Float32Array(512);
      for (let k = 0; k < 512; k++) curve[k] = Math.max(0, Math.sin(Math.PI * k / 512)) * waveMod;
      const loopWave = () => {
        if (!this._isRunning()) return;
        wg.gain.setValueCurveAtTime(curve, this.ctx.currentTime, waveFreq);
        setTimeout(loopWave, waveFreq * 1000);
      };
      setTimeout(loopWave, 100);
      src2.connect(lp2); lp2.connect(wg); wg.connect(mg);
      src2.start(); nodes.push(src2);
    }

    return { nodes, gainNode: mg, external: true };
  }

  /** 风声变体 */
  _synth_wind({ bands=[{freq:400,Q:0.8,gain:0.3},{freq:800,Q:0.6,gain:0.2}], gustPeriod=4, gustVariance=3, vol=0.5 }) {
    const mg = this._gain(vol); mg.connect(this.masterGain);
    const nodes = [];
    const buf = this._noiseBuffer(4, 'pink');

    bands.forEach(({ freq, Q, gain: bGain }, i) => {
      const src = this.ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const bp = this._filter('bandpass', freq, Q);
      const g = this._gain(0);
      const gust = () => {
        if (!this._isRunning()) return;
        const period = gustPeriod + Math.random() * gustVariance;
        const peak = bGain * (0.7 + Math.random() * 0.6);
        const t = this.ctx.currentTime;
        g.gain.setValueAtTime(g.gain.value || 0.01, t);
        g.gain.linearRampToValueAtTime(peak, t + period * 0.35);
        g.gain.linearRampToValueAtTime(bGain * 0.1, t + period);
        setTimeout(gust, period * 900);
      };
      setTimeout(gust, i * 700);
      src.connect(bp); bp.connect(g); g.connect(mg);
      src.start(); nodes.push(src);
    });

    return { nodes, gainNode: mg, external: true };
  }

  /** 火焰声变体 */
  _synth_fire({ baseFreq=800, crackleRate=600, crackleGain=0.04, droneFreq=200, droneGain=0.5, vol=0.55 }) {
    const mg = this._gain(vol); mg.connect(this.masterGain);
    const nodes = [];

    const src = this._loopNoise('brown');
    const lp = this._filter('lowpass', droneFreq);
    const g = this._gain(droneGain);
    src.connect(lp); lp.connect(g); g.connect(mg);
    src.start(); nodes.push(src);

    const crackle = () => {
      if (!this._isRunning()) return;
      const delay = 100 + Math.random() * crackleRate;
      const o = this._osc('sawtooth', 100 + Math.random() * 200);
      const e = this._gain(0);
      const hp = this._filter('highpass', baseFreq * (0.8 + Math.random()*0.4));
      const t = this.ctx.currentTime;
      e.gain.setValueAtTime(0, t);
      e.gain.linearRampToValueAtTime(crackleGain + Math.random()*crackleGain, t + 0.003);
      e.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random()*0.1);
      o.connect(hp); hp.connect(e); e.connect(mg);
      o.start(t); o.stop(t + 0.18);
      setTimeout(crackle, delay);
    };
    setTimeout(crackle, 200);

    return { nodes, gainNode: mg, external: true };
  }

  /** 鸟鸣/虫鸣变体 */
  _synth_birds({ windGain=0.15, windFreq=600, birdFreqMin=1800, birdFreqMax=3500, birdInterval=2000, birdVariance=4000, numNotes=4, birdGain=0.04, extraOscs=[], vol=0.55 }) {
    const mg = this._gain(vol); mg.connect(this.masterGain);
    const nodes = [];

    // 底层自然风声
    if (windGain > 0) {
      const ws = this._loopNoise('pink');
      const bp = this._filter('bandpass', windFreq, 0.5);
      const wg = this._gain(windGain);
      ws.connect(bp); bp.connect(wg); wg.connect(mg);
      ws.start(); nodes.push(ws);
    }

    // 持续振荡（蟋蟀/蝉）
    extraOscs.forEach(({ freq, lfoFreq, gain: og, type='sine' }) => {
      const o = this._osc(type, freq);
      const lfo = this._osc('square', lfoFreq);
      const lg = this._gain(og);
      const eg = this._gain(og);
      lfo.connect(lg); lg.connect(eg.gain); o.connect(eg); eg.connect(mg);
      o.start(); lfo.start();
      nodes.push(o, lfo);
    });

    // 随机鸟鸣
    const chirp = () => {
      if (!this._isRunning()) return;
      const delay = birdInterval + Math.random() * birdVariance;
      const n = 1 + Math.floor(Math.random() * numNotes);
      const base = birdFreqMin + Math.random() * (birdFreqMax - birdFreqMin);
      for (let i = 0; i < n; i++) {
        const ti = this.ctx.currentTime + i * (0.1 + Math.random() * 0.08);
        const o = this._osc('sine', base + Math.random() * 300);
        const e = this._gain(0); e.connect(mg);
        o.frequency.setValueAtTime(base + Math.random()*300, ti);
        o.frequency.linearRampToValueAtTime(base + 400 + Math.random()*400, ti + 0.08);
        e.gain.setValueAtTime(0, ti);
        e.gain.linearRampToValueAtTime(birdGain, ti + 0.02);
        e.gain.exponentialRampToValueAtTime(0.0001, ti + 0.18);
        o.connect(e); o.start(ti); o.stop(ti + 0.22);
      }
      setTimeout(chirp, delay);
    };
    setTimeout(chirp, 500);

    return { nodes, gainNode: mg, external: true };
  }

  /** 双耳节拍 */
  _synth_binaural({ carrier=100, beat=2, noiseGain=0.06, vol=0.3 }) {
    const mg = this._gain(vol); mg.connect(this.masterGain);
    const merger = this.ctx.createChannelMerger(2);
    merger.connect(mg);
    const nodes = [];

    [0, 1].forEach(ch => {
      const o = this._osc('sine', carrier + ch * beat);
      const g = this._gain(0.4);
      o.connect(g); g.connect(merger, 0, ch);
      o.start(); nodes.push(o);
    });

    if (noiseGain > 0) {
      const ns = this._loopNoise('pink');
      const ng = this._gain(noiseGain);
      ns.connect(ng); ng.connect(mg);
      ns.start(); nodes.push(ns);
    }

    return { nodes, gainNode: mg, external: true };
  }

  /** 音调/唱钵/冥想音 */
  _synth_tone({ fundamentals=[], noiseBase=null, vol=0.35 }) {
    const mg = this._gain(vol); mg.connect(this.masterGain);
    const nodes = [];

    // 底噪
    if (noiseBase) {
      const ns = this._loopNoise(noiseBase.type || 'pink');
      const lp = this._filter('lowpass', noiseBase.freq || 500);
      const ng = this._gain(noiseBase.gain || 0.1);
      ns.connect(lp); lp.connect(ng); ng.connect(mg);
      ns.start(); nodes.push(ns);
    }

    // 基频 + 泛音
    fundamentals.forEach(({ freq, type='sine', gain: fg=0.3, tremolo=0, attack=0.5 }) => {
      const o = this._osc(type, freq);
      const e = this._gain(0);
      e.connect(mg);
      const t = this.ctx.currentTime;
      e.gain.linearRampToValueAtTime(fg, t + attack);

      if (tremolo > 0) {
        const lfo = this._osc('sine', tremolo);
        const lg = this._gain(fg * 0.3);
        lfo.connect(lg); lg.connect(e.gain);
        lfo.start(); nodes.push(lfo);
      }

      o.connect(e); o.start();
      nodes.push(o);
    });

    return { nodes, gainNode: mg, external: true };
  }

  /** 唱钵攻击/衰减声（bell-like）*/
  _synth_bowl({ freq=432, harmonics=[1, 2.756, 5.404], decayTime=4, repeatInterval=6, vol=0.4 }) {
    const mg = this._gain(vol); mg.connect(this.masterGain);
    const nodes = [];

    // 底层共鸣底噪
    const ns = this._loopNoise('pink');
    const lp = this._filter('lowpass', 400);
    const ng = this._gain(0.05);
    ns.connect(lp); lp.connect(ng); ng.connect(mg);
    ns.start(); nodes.push(ns);

    const strike = () => {
      if (!this._isRunning()) return;
      harmonics.forEach((ratio, i) => {
        const f = freq * ratio;
        const o = this._osc('sine', f);
        const e = this._gain(0);
        const t = this.ctx.currentTime;
        const gainPeak = 0.25 / (i + 1);
        e.gain.setValueAtTime(0, t);
        e.gain.linearRampToValueAtTime(gainPeak, t + 0.01);
        e.gain.exponentialRampToValueAtTime(0.0001, t + decayTime * (1 - i * 0.15));
        o.connect(e); e.connect(mg);
        o.start(t); o.stop(t + decayTime + 0.2);
      });
      setTimeout(strike, repeatInterval * 1000);
    };
    strike();

    return { nodes, gainNode: mg, external: true };
  }

  /** 室内/城市氛围 */
  _synth_room({ murmurGain=0.2, murmurFreq=400, clickRate=0, clickFreqMin=800, clickFreqMax=1500, hum=0, humFreq=60, extraLayers=[], vol=0.5 }) {
    const mg = this._gain(vol); mg.connect(this.masterGain);
    const nodes = [];

    // 人声底噪/室内共鸣
    const ms = this._loopNoise('pink');
    const mbp = this._filter('bandpass', murmurFreq, 0.5);
    const mgg = this._gain(murmurGain);
    ms.connect(mbp); mbp.connect(mgg); mgg.connect(mg);
    ms.start(); nodes.push(ms);

    // 电气嗡嗡声
    if (hum > 0) {
      const ho = this._osc('sine', humFreq);
      const h2 = this._osc('sine', humFreq * 2);
      const hg = this._gain(hum);
      ho.connect(hg); h2.connect(hg); hg.connect(mg);
      ho.start(); h2.start(); nodes.push(ho, h2);
    }

    // 随机点击/碰撞声
    if (clickRate > 0) {
      const click = () => {
        if (!this._isRunning()) return;
        const delay = 500 + Math.random() * clickRate * 1000;
        const t = this.ctx.currentTime;
        const o = this._osc('sine', clickFreqMin + Math.random() * (clickFreqMax - clickFreqMin));
        const e = this._gain(0); e.connect(mg);
        e.gain.setValueAtTime(0, t);
        e.gain.linearRampToValueAtTime(0.02 + Math.random()*0.02, t + 0.005);
        e.gain.exponentialRampToValueAtTime(0.0001, t + 0.3 + Math.random()*0.3);
        o.connect(e); o.start(t); o.stop(t + 0.7);
        setTimeout(click, delay);
      };
      setTimeout(click, 800);
    }

    // 额外音层
    extraLayers.forEach(({ type, freq, gain: lg, Q, filterType }) => {
      const src = this._loopNoise(type || 'pink');
      let last = src;
      if (filterType) {
        const f = this._filter(filterType, freq, Q || 1);
        src.connect(f); last = f;
      }
      const g = this._gain(lg);
      last.connect(g); g.connect(mg);
      src.start(); nodes.push(src);
    });

    return { nodes, gainNode: mg, external: true };
  }

  /** 机械/交通噪声 */
  _synth_mechanical({ baseFreq=80, harmonics=[1,2,3,4], droneGain=0.3, rumbleGain=0.2, wooshGain=0, vol=0.55 }) {
    const mg = this._gain(vol); mg.connect(this.masterGain);
    const nodes = [];

    // 低频隆隆声
    const rs = this._loopNoise('brown');
    const rlp = this._filter('lowpass', 300);
    const rg = this._gain(rumbleGain);
    rs.connect(rlp); rlp.connect(rg); rg.connect(mg);
    rs.start(); nodes.push(rs);

    // 谐波音调
    harmonics.forEach((ratio, i) => {
      const o = this._osc('sine', baseFreq * ratio);
      const g = this._gain(droneGain / (i + 1));
      o.connect(g); g.connect(mg);
      o.start(); nodes.push(o);
    });

    // 气流呼啸
    if (wooshGain > 0) {
      const ws = this._loopNoise('pink');
      const wbp = this._filter('bandpass', 1200, 1.5);
      const wg = this._gain(wooshGain);
      ws.connect(wbp); wbp.connect(wg); wg.connect(mg);
      ws.start(); nodes.push(ws);
    }

    return { nodes, gainNode: mg, external: true };
  }

  /* ══════════════════════════════════════
     辅助方法
  ══════════════════════════════════════ */
  _currentId = null;
  _isRunning() {
    if (!this._currentId) return true;
    return Object.values(this.sources).some(s => s.playing);
  }

  /* ══════════════════════════════════════
     公开 API
  ══════════════════════════════════════ */
  play(id, vol = 0.7) {
    this._ensureCtx();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.sources[id]?.playing) { this.setVolume(id, vol); return; }

    const def = SOUND_DEFS[id];
    if (!def) { console.warn('Unknown sound:', id); return; }

    this._currentId = id;
    const synthFn = this[`_synth_${def.synth}`]?.bind(this);
    if (!synthFn) { console.warn('Unknown synth:', def.synth); return; }

    const params = { ...def.params, vol };
    const result = synthFn(params);
    this.sources[id] = { ...result, playing: true };
  }

  stop(id, fadeTime = 0.8) {
    const s = this.sources[id];
    if (!s) return;
    s.playing = false;
    const t = this.ctx.currentTime;
    s.gainNode.gain.setValueAtTime(s.gainNode.gain.value || 0.001, t);
    s.gainNode.gain.linearRampToValueAtTime(0.0001, t + fadeTime);
    setTimeout(() => {
      try {
        s.nodes.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch(e){} });
        s.gainNode.disconnect?.();
      } catch(e) {}
      delete this.sources[id];
    }, (fadeTime + 0.15) * 1000);
  }

  stopAll(fadeTime = 1.5) {
    Object.keys(this.sources).forEach(id => this.stop(id, fadeTime));
  }

  setVolume(id, vol) {
    const s = this.sources[id];
    if (!s || !this.ctx) return;
    s.gainNode.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.15);
  }

  setMasterVolume(vol) {
    this.masterVol = vol;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
  }

  fadeOutAll(durationSec) {
    if (!this.masterGain) return;
    const t = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterVol, t);
    this.masterGain.gain.linearRampToValueAtTime(0, t + durationSec);
    setTimeout(() => this.stopAll(0), durationSec * 1000 + 200);
  }

  isPlaying(id) { return !!this.sources[id]?.playing; }
  anyPlaying() { return Object.values(this.sources).some(s => s.playing); }
}

/* ══════════════════════════════════════════════════════════
   100款声音定义表
   格式: { synth: '合成器类型', params: { ...参数 } }
══════════════════════════════════════════════════════════ */
const SOUND_DEFS = {
  /* ─── 雨声类 12款 ─── */
  'rain-light':     { synth:'rain',  params:{ hp:2400, lp:5000, baseGain:0.35, dropRate:0.12, dropFreqMin:1200, dropFreqMax:3000 }},
  'rain-medium':    { synth:'rain',  params:{ hp:1200, lp:8000, baseGain:0.55, dropRate:0.2,  dropFreqMin:800,  dropFreqMax:2500 }},
  'rain-heavy':     { synth:'rain',  params:{ hp:600,  lp:12000,baseGain:0.75, dropRate:0.35, dropFreqMin:400,  dropFreqMax:2000, thunderGain:0.15 }},
  'rain-storm':     { synth:'rain',  params:{ hp:400,  lp:14000,baseGain:0.85, dropRate:0.5,  dropFreqMin:300,  dropFreqMax:1500, thunderGain:0.35, wind:true }},
  'rain-thunder':   { synth:'rain',  params:{ hp:800,  lp:10000,baseGain:0.6,  dropRate:0.25, dropFreqMin:600,  dropFreqMax:2000, thunderGain:0.5 }},
  'rain-drip':      { synth:'rain',  params:{ hp:3000, lp:4000, baseGain:0.2,  dropRate:0.05, dropFreqMin:1500, dropFreqMax:4000 }},
  'rain-window':    { synth:'rain',  params:{ hp:2000, lp:6000, baseGain:0.4,  dropRate:0.08, dropFreqMin:1000, dropFreqMax:2500 }},
  'rain-tropical':  { synth:'rain',  params:{ hp:500,  lp:16000,baseGain:0.8,  dropRate:0.6,  dropFreqMin:200,  dropFreqMax:2500, wind:true }},
  'rain-mountain':  { synth:'rain',  params:{ hp:1600, lp:7000, baseGain:0.5,  dropRate:0.18, dropFreqMin:900,  dropFreqMax:2800, wind:true }},
  'rain-umbrella':  { synth:'rain',  params:{ hp:3000, lp:5000, baseGain:0.45, dropRate:0.1,  dropFreqMin:2000, dropFreqMax:5000 }},
  'rain-afterrain': { synth:'rain',  params:{ hp:2800, lp:4000, baseGain:0.2,  dropRate:0.04, dropFreqMin:1600, dropFreqMax:3500 }},
  'rain-sleet':     { synth:'rain',  params:{ hp:3500, lp:6000, baseGain:0.5,  dropRate:0.08, dropFreqMin:2500, dropFreqMax:6000 }},

  /* ─── 水声类 10款 ─── */
  'water-ocean':      { synth:'water', params:{ noiseType:'pink', lpFreq:1200, gain:0.5, waveFreq:6, waveMod:0.45 }},
  'water-shore':      { synth:'water', params:{ noiseType:'pink', lpFreq:900,  gain:0.4, waveFreq:8, waveMod:0.35, bpFreq:600, Q:0.6 }},
  'water-stream':     { synth:'water', params:{ noiseType:'white',lpFreq:3000, bpFreq:1200, Q:1.2, gain:0.5 }},
  'water-waterfall':  { synth:'water', params:{ noiseType:'white',lpFreq:6000, gain:0.65 }},
  'water-brook':      { synth:'water', params:{ noiseType:'pink', lpFreq:2500, bpFreq:900, Q:0.8, gain:0.45 }},
  'water-lake':       { synth:'water', params:{ noiseType:'pink', lpFreq:800,  gain:0.3, waveFreq:10, waveMod:0.25 }},
  'water-drops':      { synth:'rain',  params:{ hp:3500, lp:4500, baseGain:0.08, dropRate:0.05, dropFreqMin:1800, dropFreqMax:4500 }},
  'water-hotspring':  { synth:'water', params:{ noiseType:'brown',lpFreq:600,  gain:0.4, bpFreq:300, Q:0.5 }},
  'water-fountain':   { synth:'water', params:{ noiseType:'white',lpFreq:4000, bpFreq:1800, Q:1.5, gain:0.5 }},
  'water-pipe':       { synth:'water', params:{ noiseType:'brown',lpFreq:400,  bpFreq:180, Q:0.8, gain:0.45 }},

  /* ─── 风声类 8款 ─── */
  'wind-gentle': { synth:'wind', params:{ bands:[{freq:300,Q:0.8,gain:0.2},{freq:600,Q:0.6,gain:0.15}], gustPeriod:5, gustVariance:4 }},
  'wind-gust':   { synth:'wind', params:{ bands:[{freq:400,Q:1,gain:0.4},{freq:800,Q:0.8,gain:0.3}],   gustPeriod:3, gustVariance:2 }},
  'wind-tunnel': { synth:'wind', params:{ bands:[{freq:200,Q:1.5,gain:0.5},{freq:400,Q:1.2,gain:0.4},{freq:700,Q:1,gain:0.25}], gustPeriod:8, gustVariance:2 }},
  'wind-north':  { synth:'wind', params:{ bands:[{freq:250,Q:0.6,gain:0.45},{freq:500,Q:0.5,gain:0.3},{freq:1000,Q:0.4,gain:0.15}], gustPeriod:2.5, gustVariance:1.5 }},
  'wind-bamboo': { synth:'wind', params:{ bands:[{freq:600,Q:1.5,gain:0.3},{freq:1200,Q:2,gain:0.2}], gustPeriod:4, gustVariance:3 }},
  'wind-desert': { synth:'wind', params:{ bands:[{freq:180,Q:0.5,gain:0.4},{freq:350,Q:0.4,gain:0.3}], gustPeriod:6, gustVariance:5 }},
  'wind-mountain':{ synth:'wind', params:{ bands:[{freq:300,Q:0.7,gain:0.35},{freq:700,Q:0.6,gain:0.25},{freq:1400,Q:0.5,gain:0.1}], gustPeriod:4, gustVariance:3 }},
  'wind-sea':    { synth:'wind', params:{ bands:[{freq:250,Q:0.6,gain:0.3},{freq:500,Q:0.5,gain:0.2}], gustPeriod:7, gustVariance:4 }},

  /* ─── 森林/动物类 10款 ─── */
  'nature-forest':    { synth:'birds',  params:{ windGain:0.2, windFreq:600, birdFreqMin:1800, birdFreqMax:3500, birdInterval:2000, birdVariance:3500, numNotes:4, birdGain:0.04 }},
  'nature-birds':     { synth:'birds',  params:{ windGain:0.1, windFreq:500, birdFreqMin:2000, birdFreqMax:5000, birdInterval:800,  birdVariance:1500, numNotes:6, birdGain:0.05 }},
  'nature-night':     { synth:'birds',  params:{ windGain:0.05,windFreq:400, birdFreqMin:800,  birdFreqMax:1500, birdInterval:3000, birdVariance:5000, numNotes:3, birdGain:0.03, extraOscs:[{freq:3800,lfoFreq:16,gain:0.04},{freq:4200,lfoFreq:18,gain:0.03}] }},
  'nature-cicadas':   { synth:'birds',  params:{ windGain:0.08,windFreq:800, birdFreqMin:3000, birdFreqMax:4000, birdInterval:8000, birdVariance:10000,numNotes:1, birdGain:0.02, extraOscs:[{freq:4000,lfoFreq:40,gain:0.05},{freq:4400,lfoFreq:38,gain:0.04}] }},
  'nature-owl':       { synth:'birds',  params:{ windGain:0.12,windFreq:400, birdFreqMin:250,  birdFreqMax:450,  birdInterval:4000, birdVariance:8000, numNotes:2, birdGain:0.06 }},
  'nature-frogs':     { synth:'birds',  params:{ windGain:0.1, windFreq:500, birdFreqMin:250,  birdFreqMax:350,  birdInterval:1200, birdVariance:2000, numNotes:3, birdGain:0.05 }},
  'nature-crickets':  { synth:'birds',  params:{ windGain:0.06,windFreq:400, birdFreqMin:4000, birdFreqMax:5000, birdInterval:5000, birdVariance:8000, numNotes:1, birdGain:0.02, extraOscs:[{freq:3600,lfoFreq:14,gain:0.035},{freq:4000,lfoFreq:16,gain:0.03}] }},
  'nature-bees':      { synth:'birds',  params:{ windGain:0.08,windFreq:600, birdFreqMin:600,  birdFreqMax:900,  birdInterval:400,  birdVariance:600,  numNotes:1, birdGain:0.02, extraOscs:[{freq:240,lfoFreq:0.5,gain:0.05,type:'sawtooth'}] }},
  'nature-morning':   { synth:'birds',  params:{ windGain:0.15,windFreq:550, birdFreqMin:1500, birdFreqMax:4500, birdInterval:600,  birdVariance:1200, numNotes:5, birdGain:0.045 }},
  'nature-jungle':    { synth:'birds',  params:{ windGain:0.2, windFreq:700, birdFreqMin:1200, birdFreqMax:6000, birdInterval:500,  birdVariance:800,  numNotes:7, birdGain:0.05, extraOscs:[{freq:300,lfoFreq:1.5,gain:0.04}] }},

  /* ─── 火焰类 6款 ─── */
  'fire-campfire':  { synth:'fire', params:{ baseFreq:800,  crackleRate:800,  crackleGain:0.04, droneFreq:200, droneGain:0.5 }},
  'fire-fireplace': { synth:'fire', params:{ baseFreq:600,  crackleRate:1200, crackleGain:0.03, droneFreq:150, droneGain:0.55 }},
  'fire-candle':    { synth:'fire', params:{ baseFreq:1200, crackleRate:2000, crackleGain:0.015,droneFreq:300, droneGain:0.3 }},
  'fire-woodstove': { synth:'fire', params:{ baseFreq:500,  crackleRate:600,  crackleGain:0.05, droneFreq:120, droneGain:0.6 }},
  'fire-charcoal':  { synth:'fire', params:{ baseFreq:700,  crackleRate:500,  crackleGain:0.06, droneFreq:180, droneGain:0.45 }},
  'fire-bonfire':   { synth:'fire', params:{ baseFreq:600,  crackleRate:400,  crackleGain:0.07, droneFreq:140, droneGain:0.65 }},

  /* ─── 城市/室内类 10款 ─── */
  'room-cafe':      { synth:'room', params:{ murmurGain:0.25, murmurFreq:400, clickRate:5, clickFreqMin:1200, clickFreqMax:2000 }},
  'room-library':   { synth:'room', params:{ murmurGain:0.06, murmurFreq:300, clickRate:20,clickFreqMin:800,  clickFreqMax:1200 }},
  'room-office':    { synth:'room', params:{ murmurGain:0.1,  murmurFreq:350, hum:0.03, humFreq:60, clickRate:8, clickFreqMin:1000, clickFreqMax:1500, extraLayers:[{type:'white',filterType:'highpass',freq:3000,gain:0.04}] }},
  'room-restaurant':{ synth:'room', params:{ murmurGain:0.35, murmurFreq:450, clickRate:3, clickFreqMin:1000, clickFreqMax:1800 }},
  'room-market':    { synth:'room', params:{ murmurGain:0.45, murmurFreq:500, clickRate:1.5,clickFreqMin:800,  clickFreqMax:1500 }},
  'room-classroom': { synth:'room', params:{ murmurGain:0.2,  murmurFreq:380, clickRate:12,clickFreqMin:900,  clickFreqMax:1400 }},
  'room-citynight': { synth:'room', params:{ murmurGain:0.12, murmurFreq:250, hum:0.02, humFreq:50, extraLayers:[{type:'pink',filterType:'bandpass',freq:200,Q:0.4,gain:0.15}] }},
  'room-temple':    { synth:'room', params:{ murmurGain:0.04, murmurFreq:200, hum:0.015,humFreq:55, extraLayers:[{type:'pink',filterType:'lowpass',freq:300,gain:0.12}] }},
  'room-church':    { synth:'room', params:{ murmurGain:0.05, murmurFreq:160, hum:0.04, humFreq:48, extraLayers:[{type:'brown',filterType:'lowpass',freq:200,gain:0.2}] }},
  'room-empty':     { synth:'room', params:{ murmurGain:0.02, murmurFreq:180, hum:0.025,humFreq:60, extraLayers:[{type:'pink',filterType:'bandpass',freq:300,Q:0.3,gain:0.08}] }},

  /* ─── 噪音类 8款 ─── */
  'noise-white':  { synth:'noise', params:{ noiseType:'white', gain:0.4 }},
  'noise-pink':   { synth:'noise', params:{ noiseType:'pink',  gain:0.5 }},
  'noise-brown':  { synth:'noise', params:{ noiseType:'brown', filterType:'lowpass', freq:600, gain:0.55 }},
  'noise-blue':   { synth:'noise', params:{ noiseType:'blue',  filterType:'highpass',freq:4000,gain:0.4 }},
  'noise-violet': { synth:'noise', params:{ noiseType:'violet',filterType:'highpass',freq:8000,gain:0.35 }},
  'noise-grey':   { synth:'noise', params:{ noiseType:'pink',  filterType:'bandpass',freq:1000,Q:0.5,gain:0.45 }},
  'noise-green':  { synth:'noise', params:{ noiseType:'pink',  filterType:'bandpass',freq:500, Q:0.8,gain:0.5 }},
  'noise-fan':    { synth:'noise', params:{ noiseType:'pink',  filterType:'bandpass',freq:300, Q:1.2,gain:0.45 }},

  /* ─── 双耳节拍 8款 ─── */
  'binaural-delta1':  { synth:'binaural', params:{ carrier:80,  beat:1,  noiseGain:0.05 }},
  'binaural-delta2':  { synth:'binaural', params:{ carrier:100, beat:2,  noiseGain:0.06 }},
  'binaural-theta4':  { synth:'binaural', params:{ carrier:100, beat:4,  noiseGain:0.06 }},
  'binaural-theta6':  { synth:'binaural', params:{ carrier:100, beat:6,  noiseGain:0.07 }},
  'binaural-alpha8':  { synth:'binaural', params:{ carrier:100, beat:8,  noiseGain:0.07 }},
  'binaural-alpha10': { synth:'binaural', params:{ carrier:100, beat:10, noiseGain:0.08 }},
  'binaural-beta14':  { synth:'binaural', params:{ carrier:100, beat:14, noiseGain:0.08 }},
  'binaural-gamma40': { synth:'binaural', params:{ carrier:100, beat:40, noiseGain:0.09 }},

  /* ─── 音调/唱钵 10款 ─── */
  'tone-432':    { synth:'tone', params:{ fundamentals:[{freq:432,gain:0.25,tremolo:0.05},{freq:864,gain:0.1},{freq:1296,gain:0.05}], noiseBase:{type:'pink',freq:400,gain:0.08} }},
  'tone-528':    { synth:'tone', params:{ fundamentals:[{freq:528,gain:0.25,tremolo:0.06},{freq:1056,gain:0.1}], noiseBase:{type:'pink',freq:500,gain:0.08} }},
  'tone-639':    { synth:'tone', params:{ fundamentals:[{freq:639,gain:0.22,tremolo:0.04},{freq:1278,gain:0.08}], noiseBase:{type:'pink',freq:600,gain:0.07} }},
  'tone-741':    { synth:'tone', params:{ fundamentals:[{freq:741,gain:0.2, tremolo:0.05}], noiseBase:{type:'pink',freq:700,gain:0.07} }},
  'tone-om':     { synth:'tone', params:{ fundamentals:[{freq:136,gain:0.3,tremolo:0.03,type:'sawtooth'},{freq:272,gain:0.15},{freq:408,gain:0.08}], noiseBase:{type:'brown',freq:200,gain:0.1} }},
  'tone-bowl432':{ synth:'bowl', params:{ freq:432, harmonics:[1,2.756,5.404], decayTime:5, repeatInterval:7 }},
  'tone-bowl528':{ synth:'bowl', params:{ freq:528, harmonics:[1,2.756,5.404], decayTime:4.5,repeatInterval:6 }},
  'tone-crystal':{ synth:'bowl', params:{ freq:528, harmonics:[1,3.011,6.2],   decayTime:6, repeatInterval:8 }},
  'tone-windchime':{ synth:'birds', params:{ windGain:0.1,windFreq:800,birdFreqMin:1200,birdFreqMax:4000,birdInterval:2000,birdVariance:4000,numNotes:2,birdGain:0.06 }},
  'tone-piano':  { synth:'room', params:{ murmurGain:0.03, murmurFreq:200, clickRate:6, clickFreqMin:260, clickFreqMax:880, extraLayers:[{type:'pink',filterType:'lowpass',freq:300,gain:0.08}] }},

  /* ─── 机械/交通类 6款 ─── */
  'mech-train':    { synth:'mechanical', params:{ baseFreq:60,  harmonics:[1,2,3,4,6], droneGain:0.2, rumbleGain:0.35, wooshGain:0.15 }},
  'mech-subway':   { synth:'mechanical', params:{ baseFreq:80,  harmonics:[1,2,4],     droneGain:0.18,rumbleGain:0.4,  wooshGain:0.1 }},
  'mech-airplane': { synth:'mechanical', params:{ baseFreq:100, harmonics:[1,2,3],     droneGain:0.15,rumbleGain:0.3,  wooshGain:0.25 }},
  'mech-car':      { synth:'mechanical', params:{ baseFreq:90,  harmonics:[1,2,3,5],   droneGain:0.2, rumbleGain:0.3,  wooshGain:0.08 }},
  'mech-engine':   { synth:'mechanical', params:{ baseFreq:50,  harmonics:[1,2,3],     droneGain:0.25,rumbleGain:0.45 }},
  'mech-spaceship':{ synth:'mechanical', params:{ baseFreq:40,  harmonics:[1,2],       droneGain:0.2, rumbleGain:0.3,  wooshGain:0.3 }},

  /* ─── 特殊环境类 10款 ─── */
  'env-cave':       { synth:'water', params:{ noiseType:'brown',lpFreq:300,  gain:0.35, bpFreq:150, Q:0.4 }},
  'env-underwater': { synth:'water', params:{ noiseType:'brown',lpFreq:200,  gain:0.4,  bpFreq:100, Q:0.3, waveFreq:12, waveMod:0.2 }},
  'env-space':      { synth:'tone',  params:{ fundamentals:[{freq:55,gain:0.15,tremolo:0.02},{freq:82,gain:0.1,tremolo:0.03}], noiseBase:{type:'brown',freq:150,gain:0.12} }},
  'env-spacestation':{ synth:'mechanical',params:{ baseFreq:45, harmonics:[1,2,3,4], droneGain:0.12,rumbleGain:0.15, wooshGain:0.05 }},
  'env-basement':   { synth:'room',  params:{ murmurGain:0.04, murmurFreq:120, hum:0.05, humFreq:50, extraLayers:[{type:'brown',filterType:'lowpass',freq:200,gain:0.2}] }},
  'env-desert':     { synth:'wind',  params:{ bands:[{freq:150,Q:0.4,gain:0.35},{freq:300,Q:0.3,gain:0.2}], gustPeriod:8, gustVariance:6 }},
  'env-snowstorm':  { synth:'wind',  params:{ bands:[{freq:500,Q:1.2,gain:0.4},{freq:1000,Q:1,gain:0.3},{freq:2000,Q:0.8,gain:0.15}], gustPeriod:3, gustVariance:2 }},
  'env-aurora':     { synth:'tone',  params:{ fundamentals:[{freq:60,gain:0.12,tremolo:0.02},{freq:90,gain:0.08,tremolo:0.015},{freq:120,gain:0.05}], noiseBase:{type:'pink',freq:300,gain:0.06} }},
  'env-ancient-forest':{ synth:'birds', params:{ windGain:0.18, windFreq:450, birdFreqMin:800, birdFreqMax:2500, birdInterval:3500, birdVariance:6000, numNotes:3, birdGain:0.04, extraOscs:[{freq:60,lfoFreq:0.3,gain:0.04}] }},
  'env-dream':      { synth:'tone',  params:{ fundamentals:[{freq:64,gain:0.08,tremolo:0.01},{freq:96,gain:0.06,tremolo:0.015},{freq:128,gain:0.04,tremolo:0.02},{freq:192,gain:0.03}], noiseBase:{type:'pink',freq:250,gain:0.05} }},
};

window.audioEngine = new AudioEngine();
