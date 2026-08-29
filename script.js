(() => {
  const pages = [...document.querySelectorAll('.page')];
  const dots = document.querySelector('#dots');
  const pageNumber = document.querySelector('#pageNumber');
  const progressBar = document.querySelector('#progressBar');
  const toast = document.querySelector('#toast');
  let current = 0;
  let audioOn = false;
  let audioCtx;

  pages.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `跳转到第 ${index + 1} 页`);
    dot.addEventListener('click', () => showPage(index));
    dots.appendChild(dot);
  });

  function showPage(index, direction = 1) {
    current = Math.max(0, Math.min(pages.length - 1, index));
    pages.forEach((page, i) => {
      page.classList.toggle('active', i === current);
      if (i === current) page.scrollTop = 0;
    });
    [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === current));
    pageNumber.textContent = String(current + 1).padStart(2, '0');
    progressBar.style.width = `${((current + 1) / pages.length) * 100}%`;
    tone(direction > 0 ? 620 : 420);
  }
  showPage(0, 0);

  document.querySelectorAll('[data-next]').forEach(btn => btn.addEventListener('click', () => showPage(current + 1)));
  document.querySelector('[data-restart]')?.addEventListener('click', () => showPage(0, -1));

  let startY = 0;
  let startX = 0;
  document.querySelector('.story').addEventListener('touchstart', event => {
    startY = event.changedTouches[0].clientY;
    startX = event.changedTouches[0].clientX;
  }, { passive: true });
  document.querySelector('.story').addEventListener('touchend', event => {
    const dy = event.changedTouches[0].clientY - startY;
    const dx = event.changedTouches[0].clientX - startX;
    if (Math.abs(dy) > 55 && Math.abs(dy) > Math.abs(dx)) showPage(current + (dy < 0 ? 1 : -1), dy < 0 ? 1 : -1);
  }, { passive: true });
  document.querySelector('.story').addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) < 20) return;
    event.preventDefault();
    showPage(current + (event.deltaY > 0 ? 1 : -1), event.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  document.querySelectorAll('.bar-wrap').forEach(bar => bar.addEventListener('click', () => {
    document.querySelector('#chartNote').textContent = bar.dataset.tip;
    tone(760);
  }));

  const regionContent = {
    east: { icon: '↗', title: '东部地区 · 领跑者', sub: '江苏 · 浙江 · 广东 · 宁波', stats: [['98%', '江苏行政村覆盖率'], ['2.6万+', '浙江乡村充电桩'], ['40%', '江苏超充桩占比']], text: '东莞、义乌等乡镇进入“快充升级”阶段；宁波象山花墙村把充电桩与文旅结合，让资源再生利用。' },
    central: { icon: '≈', title: '中部地区 · 增长极', sub: '川 · 豫 · 皖 · 湘', stats: [['30.1%', '公共充电桩占比'], ['3348万', '湖南慈利县投资'], ['4小时', '节假日排队峰值']], text: '中部农村面对“春节排队 4 小时、平时吃灰”的潮汐难题，预约与共享车位成为破局关键。' },
    west: { icon: '⌁', title: '西部地区 · 攻坚者', sub: '甘肃 · 四川 · 云南', stats: [['不足20%', '农村覆盖率'], ['6000万', '甘谷县总投资'], ['45座', '规划充电站']], text: '西部侧重“光储充一体化”和智慧运营中心建设，解决地域广、人口稀疏带来的维护难题。' },
    north: { icon: '❄', title: '东北地区 · 技术答卷', sub: '黑龙江 · 吉林 · 辽宁', stats: [['13.7%', '全国保有量占比'], ['30—50%', '低温效率下降'], ['14.2万次', '试点服务次数']], text: '极寒环境催生低温预热、车网互动与光储充融合，让冬天也能稳定补能。' }
  };
  document.querySelectorAll('.region').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.region').forEach(item => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
    button.classList.add('active'); button.setAttribute('aria-selected', 'true');
    const data = regionContent[button.dataset.region];
    document.querySelector('#regionPanel').innerHTML = `<div class="region-title"><span class="region-icon">${data.icon}</span><div><b>${data.title}</b><small>${data.sub}</small></div></div><div class="mini-stats">${data.stats.map(stat => `<span><strong>${stat[0]}</strong><small>${stat[1]}</small></span>`).join('')}</div><div class="story-point"><b>新闻点</b><p>${data.text}</p></div>`;
    tone(700); showToast(`已切换至${button.textContent}区域`);
  }));

  const holidayPath = 'M0 143 C30 139 40 120 68 131 S95 108 117 118 S140 41 165 57 S190 19 212 44 S236 28 253 70 S285 12 330 22';
  const weekdayPath = 'M0 143 C30 141 47 137 68 139 S104 127 127 131 S154 114 176 123 S210 112 235 119 S276 101 304 110 S320 97 330 101';
  document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(item => item.classList.remove('active'));
    btn.classList.add('active');
    const line = document.querySelector('#loadLine');
    const dot = document.querySelector('#loadDot');
    const holiday = btn.dataset.mode === 'holiday';
    line.setAttribute('d', holiday ? holidayPath : weekdayPath);
    line.classList.toggle('weekday', !holiday);
    dot.setAttribute('cx', holiday ? '212' : '235'); dot.setAttribute('cy', holiday ? '44' : '119');
    showToast(holiday ? '节假日：晚间负荷明显抬升' : '平日：负荷较平缓'); tone(holiday ? 680 : 520);
  }));

  document.querySelector('#smartGridBtn')?.addEventListener('click', () => {
    document.querySelector('#smartModal').classList.add('open');
    document.querySelector('#smartModal').setAttribute('aria-hidden', 'false');
    tone(840);
  });
  document.querySelectorAll('[data-close-modal]').forEach(item => item.addEventListener('click', () => {
    document.querySelector('#smartModal').classList.remove('open');
    document.querySelector('#smartModal').setAttribute('aria-hidden', 'true');
  }));

  const tempSlider = document.querySelector('#tempSlider');
  tempSlider?.addEventListener('input', () => {
    const temperature = Number(tempSlider.value);
    const efficiency = Math.round(Math.max(58, Math.min(100, 94 + temperature * 1.25)));
    document.querySelector('#tempValue').textContent = temperature;
    document.querySelector('#efficiencyValue').textContent = `${efficiency}%`;
    document.querySelector('#efficiencyBar').style.width = `${efficiency}%`;
    document.querySelector('#efficiencyHint').textContent = temperature < -5 ? '低温预热已启动，建议选择带“低温预热”的超充站。' : '温度友好，普通快充即可满足日常补能。';
  });

  const powerSlider = document.querySelector('#powerSlider');
  powerSlider?.addEventListener('input', () => {
    const power = Number(powerSlider.value);
    const minutes = Math.round(5000 / power);
    document.querySelector('#powerValue').textContent = power;
    document.querySelector('#chargeTime').textContent = `${minutes} 分钟`;
    document.querySelector('#chargeNeedle').style.transform = `rotate(${(power - 30) / 210 * 270 - 135}deg)`;
  });

  const profileText = {
    '东部|家用新能源': ['优先关注车位共享', '东部覆盖率高，适合选择家用慢充与公共快充搭配的补能方式。'],
    '东部|网约车': ['优先关注夜间快充', '站点密度高，错峰补能能减少等待，也能让车辆保持高周转。'],
    '东部|乡村物流车': ['优先关注乡镇快充', '短途高频运输更需要 120kW 以上快充与稳定的村级站点。'],
    '中部|家用新能源': ['优先开启预约功能', '节假日潮汐明显，提前预约比临时排队更省时间。'],
    '中部|网约车': ['优先选择站点共享', '把闲置车位变成公共充电资源，能提升高峰时段的周转效率。'],
    '中部|乡村物流车': ['优先规划补能路线', '结合日常配送路线，选择乡镇中心站点更稳定。'],
    '西部|家用新能源': ['关注光储充试点', '距离较长的乡村出行，适合选择带储能的综合服务站。'],
    '西部|网约车': ['关注移动补能车', '覆盖盲区仍在扩大，移动补能与智慧运营是更灵活的方案。'],
    '西部|乡村物流车': ['优先选择综合服务站', '光储充一体化可减少偏远站点对电网容量的依赖。'],
    '东北|家用新能源': ['优先选择低温预热', '冬季补能先预热，关注支持低温技术的超充站。'],
    '东北|网约车': ['错峰 + 低温预热', '通过车网互动和错峰策略，减少极寒天气带来的效率损耗。'],
    '东北|乡村物流车': ['关注车网互动', '稳定、可预测的补能节奏，比单纯追求峰值功率更重要。']
  };
  let selectedArea = '东部'; let selectedCar = '家用新能源';
  function updateProfile() {
    const [headline, text] = profileText[`${selectedArea}|${selectedCar}`];
    document.querySelector('#profileLabel').textContent = `${selectedArea} · ${selectedCar}`;
    document.querySelector('#profileHeadline').textContent = headline;
    document.querySelector('#profileText').textContent = text;
  }
  document.querySelectorAll('#areaChoices button').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('#areaChoices button').forEach(item => item.classList.remove('selected')); btn.classList.add('selected'); selectedArea = btn.dataset.value; updateProfile(); tone(620); }));
  document.querySelectorAll('#carChoices button').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('#carChoices button').forEach(item => item.classList.remove('selected')); btn.classList.add('selected'); selectedCar = btn.dataset.value; updateProfile(); tone(620); }));

  document.querySelector('#soundToggle')?.addEventListener('click', () => {
    audioOn = !audioOn;
    document.querySelector('#soundToggle').classList.toggle('on', audioOn);
    document.querySelector('#soundToggle').textContent = audioOn ? '♪' : '◌';
    document.querySelector('#soundToggle').setAttribute('aria-pressed', String(audioOn));
    document.querySelector('#soundToggle').setAttribute('aria-label', audioOn ? '关闭提示音' : '开启提示音');
    if (audioOn) tone(660);
  });
  function tone(frequency) {
    if (!audioOn) return;
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = frequency; gain.gain.setValueAtTime(.0001, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(.045, audioCtx.currentTime + .015); gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .18); osc.connect(gain).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + .2);
  }
})();
