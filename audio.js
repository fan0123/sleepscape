/**
 * 眠境 Audio Player v3 — HTML5 Audio 真实文件播放
 * 所有声音均为预生成 WAV 文件，支持所有主流浏览器和移动端
 */
class AudioEngine {
  constructor() {
    this._audios     = {};   // { id: HTMLAudioElement }
    this._gainValues = {};   // { id: 0-1 }
    this.masterVol   = 0.7;
    this._fadeTimer  = null;
  }

  /** 播放 */
  play(id, vol = 0.7) {
    this._gainValues[id] = vol;
    if (!this._audios[id]) {
      const audio        = new Audio(`sounds/${id}.wav`);
      audio.loop         = true;
      audio.preload      = 'auto';
      this._audios[id]   = audio;
    }
    const audio = this._audios[id];
    audio.volume = Math.min(1, vol * this.masterVol);
    audio.play().catch(e => console.warn(`Play failed [${id}]:`, e));
  }

  /** 停止（带淡出） */
  stop(id, fadeMs = 600) {
    const audio = this._audios[id];
    if (!audio || audio.paused) return;
    const start = audio.volume;
    const steps = 20;
    const interval = fadeMs / steps;
    let step = 0;
    const fade = setInterval(() => {
      step++;
      audio.volume = Math.max(0, start * (1 - step / steps));
      if (step >= steps) {
        clearInterval(fade);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = start;  // 还原，下次播放正常
      }
    }, interval);
  }

  stopAll(fadeMs = 800) {
    Object.keys(this._audios).forEach(id => this.stop(id, fadeMs));
  }

  setVolume(id, vol) {
    this._gainValues[id] = vol;
    const audio = this._audios[id];
    if (audio) audio.volume = Math.min(1, vol * this.masterVol);
  }

  setMasterVolume(vol) {
    this.masterVol = Math.min(1, Math.max(0, vol));
    Object.entries(this._audios).forEach(([id, audio]) => {
      if (!audio.paused) {
        audio.volume = Math.min(1, (this._gainValues[id] ?? 0.7) * this.masterVol);
      }
    });
  }

  /** 渐弱后全部停止（睡眠定时器用） */
  fadeOutAll(durationSec) {
    clearInterval(this._fadeTimer);
    const steps    = 60;
    const interval = (durationSec * 1000) / steps;
    let step       = 0;
    const startVol = this.masterVol;
    this._fadeTimer = setInterval(() => {
      step++;
      this.setMasterVolume(startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(this._fadeTimer);
        this.stopAll(0);
        this.setMasterVolume(startVol);  // 定时结束后恢复音量
      }
    }, interval);
  }

  isPlaying(id) {
    const a = this._audios[id];
    return a ? !a.paused : false;
  }

  anyPlaying() {
    return Object.values(this._audios).some(a => a && !a.paused);
  }
}

window.audioEngine = new AudioEngine();
