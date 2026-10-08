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
