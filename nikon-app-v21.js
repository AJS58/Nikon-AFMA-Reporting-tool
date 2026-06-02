
'use strict';

const $ = (id) => document.getElementById(id);

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function signed(value) {
  const n = Number(value || 0);
  return n > 0 ? `+${n}` : `${n}`;
}

function focusText(value) {
  const n = Number(value || 0);
  if (n > 0) return 'Back focus';
  if (n < 0) return 'Front focus';
  return 'No correction';
}

function focusClass(value) {
  const n = Number(value || 0);
  if (n > 0) return 'back';
  if (n < 0) return 'front';
  return 'neutral';
}

function makeReference() {
  const date = $('reportDate')?.value || todayISO();
  return `NIK-${date.replaceAll('-', '')}-001`;
}

function ensureReference(force = false) {
  const ref = $('jobRef');
  if (!ref) return;
  if (force || !ref.value || !/^NIK-\d{8}-\d{3}$/.test(ref.value)) {
    ref.value = makeReference();
  }
}

function isSingleMode() {
  return $('mode')?.value === 'single';
}

function lensName() {
  return $('lensName')?.value?.trim() || 'Lens';
}

function lensNumberText() {
  const value = $('lensNumber')?.value || 'none';
  return value === 'none' ? 'No number assigned' : `Saved lens No. ${value}`;
}

function formatMetres(value) {
  if (!value) return 'Not specified';
  return `${String(value).replace('.0', '')} m`;
}

function distanceSummary() {
  if (isSingleMode()) return formatMetres($('singleDistance')?.value);
  return `Wide ${formatMetres($('wideDistance')?.value)} / Tele ${formatMetres($('teleDistance')?.value)}`;
}

function setOptions(select, values, defaultValue, formatter = (v) => v) {
  if (!select) return;
  const previous = select.value || defaultValue;
  select.innerHTML = '';
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = formatter(value);
    select.appendChild(option);
  });
  select.value = values.includes(previous) ? previous : defaultValue;
}

function populateDropdowns() {
  const lensSelect = $('lensNumber');
  if (lensSelect) {
    lensSelect.innerHTML = '';
    const none = document.createElement('option');
    none.value = 'none';
    none.textContent = 'No number assigned';
    lensSelect.appendChild(none);

    for (let i = 1; i <= 20; i += 1) {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = `Lens No. ${i}`;
      lensSelect.appendChild(option);
    }
    lensSelect.value = lensSelect.value || 'none';
  }

  const distances = [
    '0.8','0.9','1.0','1.1','1.2','1.3','1.4','1.5','1.6','1.7','1.8','1.9',
    '2.0','2.2','2.4','2.6','2.8','3.0','3.2','3.5','3.8','4.0','4.3','4.5',
    '5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0','10','11','12',
    '13','14','15','16','18','20','22','24'
  ];

  setOptions($('wideDistance'), distances, '1.2', (v) => `${String(v).replace('.0', '')} m`);
  setOptions($('teleDistance'), distances, '4.3', (v) => `${String(v).replace('.0', '')} m`);
  setOptions($('singleDistance'), distances, '4.3', (v) => `${String(v).replace('.0', '')} m`);

  const apertures = [
    '', 'f/1.2','f/1.4','f/1.8','f/2','f/2.5','f/2.8','f/3.2','f/3.5','f/4',
    'f/4.5','f/5','f/5.6','f/6.3','f/7.1','f/8','f/9','f/10','f/11','f/13','f/16'
  ];

  setOptions($('wideOptAperture'), apertures, '', (v) => v || 'Select aperture');
  setOptions($('teleOptAperture'), apertures, '', (v) => v || 'Select aperture');
  setOptions($('singleOptAperture'), apertures, '', (v) => v || 'Select aperture');
}

function setVisibility() {
  const single = isSingleMode();

  ['wtFocals', 'distanceWT', 'optWT', 'qualityWT', 'beforeWT', 'afterWT', 'scaleTele', 'teleOptCard']
    .forEach((id) => $(id)?.classList.toggle('hidden', single));

  ['singleFocalWrap', 'singleDistanceWrap', 'optSingle', 'qualitySingle', 'beforeSingleWrap', 'afterSingle']
    .forEach((id) => $(id)?.classList.toggle('hidden', !single));
}

function updateMenu() {
  const single = isSingleMode();

  const img = $('nikonMenuImage');
  if (img) {
    const required = single ? 'nikon-menu-clean-single.png' : 'nikon-menu-clean.png';
    if (!img.getAttribute('src')?.endsWith(required)) {
      img.setAttribute('src', required);
    }
  }

  const lensText = $('nikonLiveLensText');
  if (lensText) lensText.textContent = lensName();

  const lensNoText = $('nikonLiveLensNo');
  if (lensNoText) lensNoText.textContent = lensNumberText();
}

function updateOutputs() {
  if ($('wideOutput')) $('wideOutput').textContent = signed($('wideValue')?.value);
  if ($('teleOutput')) $('teleOutput').textContent = signed($('teleValue')?.value);
  if ($('singleOutput')) $('singleOutput').textContent = signed($('singleValue')?.value);
}

function updateCard(id, label, value, visible = true) {
  const card = $(id);
  if (!card) return;

  card.style.display = visible ? '' : 'none';
  if (!visible) return;

  card.className = focusClass(value);

  const span = card.querySelector('span');
  const strong = card.querySelector('strong');
  const small = card.querySelector('small');

  if (span) span.textContent = label;
  if (strong) strong.textContent = signed(value);
  if (small) small.textContent = focusText(value);
}

function updateResultCards() {
  if (isSingleMode()) {
    updateCard('beforeWideCard', 'Before single', $('beforeSingle')?.value);
    updateCard('wideCard', 'After single', $('singleValue')?.value);
    updateCard('beforeTeleCard', '', 0, false);
    updateCard('teleCard', '', 0, false);
  } else {
    updateCard('beforeWideCard', 'Before wide', $('beforeWide')?.value);
    updateCard('wideCard', 'After wide', $('wideValue')?.value);
    updateCard('beforeTeleCard', 'Before tele', $('beforeTele')?.value);
    updateCard('teleCard', 'After tele', $('teleValue')?.value);
  }
}

function updateOptimisation() {
  if ($('wideOptDisplay')) {
    $('wideOptDisplay').textContent = isSingleMode()
      ? ($('singleOptAperture')?.value || 'Not specified')
      : ($('wideOptAperture')?.value || 'Not specified');
  }

  if ($('teleOptDisplay')) {
    $('teleOptDisplay').textContent = isSingleMode()
      ? ''
      : ($('teleOptAperture')?.value || 'Not specified');
  }
}

function updateScaleLabels() {
  const single = isSingleMode();

  const scaleWide = $('scaleWide');
  if (scaleWide) {
    const b = scaleWide.querySelector('b');
    const span = scaleWide.querySelector('span');
    if (b) b.textContent = single ? 'AF' : 'WIDE';
    if (span) span.textContent = single ? signed($('singleValue')?.value) : signed($('wideValue')?.value);
  }

  const scaleTele = $('scaleTele');
  if (scaleTele) {
    scaleTele.classList.toggle('hidden', single);
    const span = scaleTele.querySelector('span');
    if (span) span.textContent = signed($('teleValue')?.value);
  }
}

function updateResultLine() {
  const line = $('resultLine');
  if (!line) return;

  if (isSingleMode()) {
    line.textContent = `Single ${signed($('beforeSingle')?.value)} → ${signed($('singleValue')?.value)}. ${lensNumberText()}.`;
  } else {
    line.textContent = `Wide ${signed($('beforeWide')?.value)} → ${signed($('wideValue')?.value)}. Tele ${signed($('beforeTele')?.value)} → ${signed($('teleValue')?.value)}. ${lensNumberText()}.`;
  }
}

function update() {
  ensureReference(false);
  setVisibility();
  updateMenu();
  updateOutputs();
  updateResultCards();
  updateOptimisation();
  updateScaleLabels();
  updateResultLine();
}

function lpText(value) {
  return value ? `${esc(value)} LP/mm` : 'Not specified';
}

function optText(value) {
  return value || 'Not specified';
}

function reportMenuHTML() {
  const image = isSingleMode() ? 'nikon-menu-clean-single.png' : 'nikon-menu-clean.png';
  return `<div class="nikonPdfMenuImageWrap">
    <img src="${image}">
    <div class="nikonPdfLensTextOnly">
      <div>${esc(lensName())}</div>
      <small>${esc(lensNumberText())}</small>
    </div>
  </div>`;
}

function printReport() {
  ensureReference(false);

  const single = isSingleMode();
  const ref = $('jobRef')?.value || makeReference();
  const date = $('reportDate')?.value || todayISO();
  const customer = $('customerName')?.value || 'Not supplied';
  const camera = $('cameraDescription')?.value || 'Not supplied';
  const lens = lensName();
  const lensNo = lensNumberText();
  const technician = $('technicianName')?.value || 'Cameracal Services';
  const reportId = `${ref}-${date.replaceAll('-', '')}`;
  const logo = document.querySelector('.brandLogo')?.src || 'logo.png';

  const sf = $('singleFocal')?.value || '105';
  const wf = $('wideFocal')?.value || '70';
  const tf = $('teleFocal')?.value || '200';

  const rows = single
    ? `<tr><td><b>Single (${esc(sf)}mm)</b></td><td class="${focusClass($('beforeSingle')?.value)}">${signed($('beforeSingle')?.value)}<br><small>${focusText($('beforeSingle')?.value)}</small></td><td class="${focusClass($('singleValue')?.value)}">${signed($('singleValue')?.value)}<br><small>${focusText($('singleValue')?.value)}</small></td></tr>`
    : `<tr><td><b>Wide (${esc(wf)}mm)</b></td><td class="${focusClass($('beforeWide')?.value)}">${signed($('beforeWide')?.value)}<br><small>${focusText($('beforeWide')?.value)}</small></td><td class="${focusClass($('wideValue')?.value)}">${signed($('wideValue')?.value)}<br><small>${focusText($('wideValue')?.value)}</small></td></tr>
       <tr><td><b>Tele (${esc(tf)}mm)</b></td><td class="${focusClass($('beforeTele')?.value)}">${signed($('beforeTele')?.value)}<br><small>${focusText($('beforeTele')?.value)}</small></td><td class="${focusClass($('teleValue')?.value)}">${signed($('teleValue')?.value)}<br><small>${focusText($('teleValue')?.value)}</small></td></tr>`;

  const lpRows = single
    ? `<tr><td><b>Single (${esc(sf)}mm)</b></td><td>${lpText($('singleLPBefore')?.value)}</td><td>${lpText($('singleLPAfter')?.value)}</td></tr>`
    : `<tr><td><b>Wide (${esc(wf)}mm)</b></td><td>${lpText($('wideLPBefore')?.value)}</td><td>${lpText($('wideLPAfter')?.value)}</td></tr>
       <tr><td><b>Tele (${esc(tf)}mm)</b></td><td>${lpText($('teleLPBefore')?.value)}</td><td>${lpText($('teleLPAfter')?.value)}</td></tr>`;

  const optRows = single
    ? `<tr><td><b>Single (${esc(sf)}mm)</b></td><td>${esc(optText($('singleOptAperture')?.value))}</td></tr>`
    : `<tr><td><b>Wide (${esc(wf)}mm)</b></td><td>${esc(optText($('wideOptAperture')?.value))}</td></tr>
       <tr><td><b>Tele (${esc(tf)}mm)</b></td><td>${esc(optText($('teleOptAperture')?.value))}</td></tr>`;

  const finalValue = single
    ? `<b>Single (${esc(sf)}mm):</b><br>${signed($('singleValue')?.value)}<br><small>${focusText($('singleValue')?.value)}</small>`
    : `<b>Wide (${esc(wf)}mm):</b><br>${signed($('wideValue')?.value)}<br><small>${focusText($('wideValue')?.value)}</small><hr><b>Tele (${esc(tf)}mm):</b><br>${signed($('teleValue')?.value)}<br><small>${focusText($('teleValue')?.value)}</small>`;

  const memoryLine = lensNo === 'No number assigned'
    ? 'No Nikon lens memory number was assigned; the optimum value has been recorded in this report.'
    : `AF Fine-Tune values have been recorded for ${esc(lensNo)}.`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(ref)} Nikon AF Fine-Tune Report</title>
<style>
@page{size:A4 landscape;margin:5mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;color:#101827;font-size:10px}.sheet{height:200mm;border:1.5px solid #0f4c81;border-radius:8px;padding:10px 12px 30px;position:relative;overflow:hidden}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f4c81;padding-bottom:8px}.header img{width:95px}.title{text-align:right;color:#0f3970}.title h1{margin:0;font-size:22px}.title h2{margin:5px 0 0;font-size:12px}.info{margin-top:8px;border:1px solid #0f4c81;border-radius:5px;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:16px}.info div{display:grid;grid-template-columns:115px 1fr;row-gap:4px}.info b{color:#0f3970}.main{margin-top:8px;display:grid;grid-template-columns:47% 53%;gap:9px}.block{border:1px solid #c8d6e2;border-radius:4px;overflow:hidden;margin-bottom:7px}.block h3{margin:0;background:#0f4c81;color:white;font-size:10px;padding:5px 7px;text-transform:uppercase}table{width:100%;border-collapse:collapse}td,th{border:1px solid #d7e0e8;padding:5px;text-align:center}th{background:#eef5fb;color:#0b3770}td:first-child,th:first-child{text-align:left}.front{color:#c62828;font-weight:bold}.back{color:#2e7d32;font-weight:bold}.neutral{color:#455a64;font-weight:bold}.note{padding:7px;min-height:42px}.menuBox{padding:4px;background:#fff}.nikonPdfMenuImageWrap{position:relative;width:100%;aspect-ratio:1448/1086;background:#000;overflow:hidden}.nikonPdfMenuImageWrap img{width:100%;height:100%;object-fit:contain;display:block}.nikonPdfLensTextOnly{position:absolute;left:7.4%;right:34%;top:67.2%;height:8.2%;color:#fff;background:transparent;overflow:hidden;display:flex;flex-direction:column;justify-content:center}.nikonPdfLensTextOnly div{font-size:5.8pt;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nikonPdfLensTextOnly small{font-size:3.6pt;line-height:1.05;margin-top:.1mm;color:#ddd}.final{border:1px solid #2e7d32;background:#f4fbf2;border-radius:5px;display:grid;grid-template-columns:45px 1fr 115px;gap:8px;padding:9px;align-items:center}.check{background:#2e7d32;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold}.final h4{margin:0 0 4px;color:#2e7d32}.finalVals{background:white;border:1px solid #95c788;border-radius:4px;padding:5px}.cert{position:absolute;left:12px;right:12px;bottom:17px;border:1px solid #0f4c81;border-radius:5px;padding:7px;display:grid;grid-template-columns:45px 1fr 220px 175px;gap:10px;align-items:center}.sig{font-family:cursive;font-size:18px;border-bottom:1px solid #222}.disclaimer{position:absolute;left:15px;right:15px;bottom:36px;font-size:7px;color:#555;text-align:center}.footer{position:absolute;left:0;right:0;bottom:0;background:#0f4c81;color:white;display:flex;justify-content:space-between;padding:6px 12px}
</style></head><body><div class="sheet">
<div class="header"><img src="${logo}"><div class="title"><h1>Nikon AF Fine-Tune Calibration Report</h1><h2>Cameracal Services</h2></div></div>
<div class="info"><div><b>Customer:</b><span>${esc(customer)}</span><b>Date:</b><span>${esc(date)}</span><b>Camera:</b><span>${esc(camera)}</span><b>Lens:</b><span>${esc(lens)}</span><b>Subject Distance:</b><span>${esc(distanceSummary())}</span><b>Saved Lens No:</b><span>${esc(lensNo)}</span></div><div><b>Reference:</b><span>${esc(ref)}</span><b>Technician:</b><span>${esc(technician)}</span><b>Mode:</b><span>${single ? 'Single' : 'Wide / Tele'}</span><b>Standard:</b><span>Nikon AF Fine-Tune Procedure v1.0</span><b>Report ID:</b><span>${esc(reportId)}</span></div></div>
<div class="main"><div>
<div class="block"><h3>Before / After AF Fine-Tune Values</h3><table><tr><th>Position</th><th>Before Fine-Tune</th><th>After Fine-Tune</th></tr>${rows}</table></div>
<div class="block"><h3>Image Resolution Performance (LP/mm)</h3><table><tr><th>Position</th><th>Before calibration</th><th>After calibration</th></tr>${lpRows}</table></div>
<div class="block"><h3>Lens Optimisation Aperture (Recommended)</h3><table><tr><th>Position</th><th>Recommended aperture</th></tr>${optRows}</table></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><div class="block"><h3>Nikon Fine-Tune Note</h3><div class="note">AF Fine-Tune values are saved against the selected Nikon lens memory number.</div></div><div class="block"><h3>Technician Notes</h3><div class="note">${esc($('techNotes')?.value || 'No additional notes entered.')}</div></div></div>
</div><div>
<div class="block"><h3>Nikon AF Fine-Tune Settings</h3><div class="menuBox">${reportMenuHTML()}</div></div>
<div class="final"><div class="check">✓</div><div><h4>Calibration Successful</h4><p>${memoryLine}</p><b>The camera and lens combination is now operating within expected calibration tolerances.</b></div><div class="finalVals">${finalValue}</div></div>
</div></div>
<div class="cert"><div class="check">✓</div><div><b>QUALITY CERTIFIED</b><br>This calibration has been performed and verified using Cameracal Services procedures.</div><div><b>Technician Signature:</b><br><div class="sig">${esc(technician)}</div>Date: ${esc(date)}</div><div><b>Reference:</b><br>${esc(ref)}<br><br><b>Report ID:</b><br>${esc(reportId)}</div></div>
<div class="disclaimer">Calibration results reflect the tested camera and lens combination under the conditions present at the time of service. Customers are advised to independently verify autofocus accuracy and overall image performance prior to any important event, travel, assignment or commercial work.</div>
<div class="footer"><span>© Cameracal Services 2026</span><span>www.cameracalservices.co.uk</span><span>Professional Calibration. Accurate Results.</span></div>
</div><script>setTimeout(() => window.print(), 350)</script></body></html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups to generate the PDF report.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function bindEvents() {
  document.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('input', update);
    el.addEventListener('change', () => {
      if (el.id === 'reportDate') ensureReference(true);
      update();
    });
  });

  document.querySelectorAll('button[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = $(button.dataset.target);
      if (!target) return;

      const step = Number(button.dataset.step || 0);
      const min = Number(target.min || -20);
      const max = Number(target.max || 20);
      const next = Number(target.value || 0) + step;
      target.value = Math.max(min, Math.min(max, next));
      update();
    });
  });

  $('pdfBtn')?.addEventListener('click', printReport);
}

document.addEventListener('DOMContentLoaded', () => {
  populateDropdowns();

  if ($('reportDate') && !$('reportDate').value) {
    $('reportDate').value = todayISO();
  }

  ensureReference(true);
  bindEvents();
  update();
});
