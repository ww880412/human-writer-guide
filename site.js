document.querySelectorAll('pre[data-copy]').forEach(pre => {
  const button = document.createElement('button');
  button.className = 'copy';
  button.textContent = '复制';
  button.type = 'button';
  button.setAttribute('aria-label', '复制这段内容');
  button.addEventListener('click', async () => {
    const text = pre.querySelector('code').textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = '已复制';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(pre.querySelector('code'));
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = '已选中，请手动复制';
    }
    setTimeout(() => button.textContent = '复制', 2500);
  });
  pre.append(button);
});

// The figure is a deterministic illustration; these controls never call the plugin.
const atlasTabs = [...document.querySelectorAll('[data-panel]')];
if (atlasTabs.length) {
  const frame = document.querySelector('#atlas-frame');
  const scaleBox = document.querySelector('.diagram-scale');
  const diagram = document.querySelector('.diagram-disclosure');
  const toggle = document.querySelector('#animation-toggle');
  const status = document.querySelector('#animation-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let time = 0;
  let last = 0;
  let duration = 28;
  const scale = () => { frame.style.transform = `scale(${scaleBox.clientWidth / 1440})`; };
  const label = () => {
    toggle.textContent = paused ? '播放动画' : '暂停动画';
    toggle.setAttribute('aria-pressed', String(paused));
    status.textContent = paused ? '演示已暂停 · 不执行插件' : '演示播放中 · 不执行插件';
  };
  const select = button => {
    const key = button.dataset.panel;
    atlasTabs.forEach(tab => {
      const selected = tab === button;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    });
    time = 0;
    duration = ['workflow', 'skills'].includes(key) ? 28 : 24;
    frame.src = `panels/${key}.html?manual`;
    frame.title = `${button.textContent.slice(3)}流程示意`;
    document.querySelector('#panel-full').href = frame.src;
    scale();
  };
  atlasTabs.forEach((button, index) => {
    button.addEventListener('click', () => select(button));
    button.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % atlasTabs.length;
      if (event.key === 'ArrowLeft') target = (index - 1 + atlasTabs.length) % atlasTabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = atlasTabs.length - 1;
      if (target === undefined) return;
      event.preventDefault();
      select(atlasTabs[target]);
      atlasTabs[target].focus();
    });
  });
  toggle.addEventListener('click', () => { paused = !paused; label(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; label(); });
  if (matchMedia('(max-width: 700px)').matches) diagram.open = false;
  diagram.addEventListener('toggle', scale);
  new ResizeObserver(scale).observe(scaleBox);
  frame.addEventListener('load', scale);
  const tick = now => {
    if (last && !paused && diagram.open && !document.hidden) time += (now - last) / 1000;
    last = now;
    if (diagram.open && frame.contentWindow.__ready) frame.contentWindow.seek(time % duration);
    requestAnimationFrame(tick);
  };
  label();
  scale();
  requestAnimationFrame(tick);
}
