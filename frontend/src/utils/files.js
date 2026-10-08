/** Resizes a chosen photo to a small square JPEG (data URL) so it stores cheaply in the database. */
export function fileToData(file, size = 120) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'), m = Math.min(im.width, im.height); c.width = c.height = size; c.getContext('2d').drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, size, size); res(c.toDataURL('image/jpeg', 0.75)); }; im.onerror = rej; im.src = r.result; };
    r.onerror = rej; r.readAsDataURL(file);
  });
}
export function downloadCsv(name, cols, rows) {
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const blob = new Blob(['\ufeff' + [cols, ...rows].map((r) => r.map(q).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
