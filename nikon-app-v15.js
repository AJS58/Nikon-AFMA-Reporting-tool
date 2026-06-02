/* Nikon AF Fine-Tune Tool v15 - direct controlled functional rebuild */

const $ = id => document.getElementById(id);

function signed(v){
  const n = Number(v) || 0;
  return n > 0 ? `+${n}` : `${n}`;
}

function focus(v){
  const n = Number(v) || 0;
  if(n > 0) return 'Back focus';
  if(n < 0) return 'Front focus';
  return 'No correction';
}

function cls(v){
  const n = Number(v) || 0;
  if(n > 0) return 'green';
  if(n < 0) return 'red';
  return 'neutral';
}

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function todayISO(){
  return new Date().toISOString().slice(0,10);
}

function makeReference(){
  const dateValue = $('reportDate')?.value || todayISO();
  return `NIK-${dateValue.replaceAll('-','')}-001`;
}

function ensureReference(force=false){
  const ref = $('reference');
  if(!ref) return;
  if(force || !ref.value || !/^NIK-\d{8}-\d{3}$/.test(ref.value)){
    ref.value = makeReference();
  }
}

function lensNumberDisplay(){
  const value = $('lensNumber')?.value || 'none';
  return value === 'none' ? 'No number assigned' : `Saved lens No. ${value}`;
}

function populateSelects(){
  const lens = $('lensNumber');
  if(lens){
    lens.innerHTML = '';
    const none = document.createElement('option');
    none.value = 'none';
    none.textContent = 'No number assigned';
    lens.appendChild(none);
    for(let i=1;i<=20;i++){
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = `Lens No. ${i}`;
      lens.appendChild(option);
    }
    lens.value = 'none';
  }

  const distances = ['0.8','1.0','1.2','1.5','2.0','2.5','3.0','4.0','4.3','5.0','6.0','8.0','10.0','12.0','15.0','18.0','20.0','24.0'];
  ['singleDistance','wideDistance','teleDistance'].forEach(id => {
    const select = $(id);
    if(select){
      const current = select.value || (id === 'wideDistance' ? '1.2' : '4.3');
      select.innerHTML = '';
      distances.forEach(d => {
        const option = document.createElement('option');
        option.value = d;
        option.textContent = `${d.replace('.0','')} m`;
        select.appendChild(option);
      });
      select.value = distances.includes(current) ? current : (id === 'wideDistance' ? '1.2' : '4.3');
    }
  });

  const apertures = ['','f/1.2','f/1.4','f/1.8','f/2','f/2.5','f/2.8','f/3.2','f/3.5','f/4','f/4.5','f/5.6','f/6.3','f/8','f/11'];
  ['singleOptAperture','wideOptAperture','teleOptAperture'].forEach(id => {
    const select = $(id);
    if(select && !select.options.length){
      apertures.forEach(a => {
        const option = document.createElement('option');
        option.value = a;
        option.textContent = a || 'Select aperture';
        select.appendChild(option);
      });
    }
  });
}

function formatDistance(value){
  if(!value) return 'Not specified';
  return `${String(value).replace('.0','')} m`;
}

function getMode(){
  return $('mode')?.value === 'single' ? 'single' : 'wideTele';
}

function isSingle(){
  return getMode() === 'single';
}

function getLensName(){
  return $('lensName')?.value?.trim() || 'Lens';
}

function updateVisibility(){
  const single = isSingle();
  ['singleFields','singleBeforeAfter','singleOpt','singleDistanceWrap'].forEach(id => {
    const el = $(id);
    if(el) el.style.display = single ? '' : 'none';
  });
  ['zoomFields','zoomBeforeAfter','zoomOpt','wideTeleDistanceWrap'].forEach(id => {
    const el = $(id);
    if(el) el.style.display = single ? 'none' : '';
  });
}

function updateMenu(){
  const single = isSingle();

  const menu = $('nikonMenu');
  if(menu) menu.classList.toggle('single-mode', single);

  const lensText = $('nikonLiveLensText');
  if(lensText) lensText.textContent = getLensName();

  const lensNo = $('nikonLiveLensNo');
  if(lensNo) lensNo.textContent = lensNumberDisplay();

  const wideLabel = $('nikonModeWide');
  if(wideLabel) wideLabel.textContent = single ? 'AF' : 'WIDE';

  const teleLabel = $('nikonModeTele');
  if(teleLabel) teleLabel.textContent = single ? '' : 'TELE';
}

function updateLiveText(){
  const single = isSingle();

  let text = '';
  if(single){
    const before = Number($('singleBefore')?.value || 0);
    const after = Number($('singleValue')?.value || 0);
    const focal = $('singleFocal')?.value || '';
    text = `Single (${focal}mm) ${signed(before)} → ${signed(after)}. ${lensNumberDisplay()}.`;
  } else {
    const bw = Number($('wideBefore')?.value || 0);
    const aw = Number($('wideValue')?.value || 0);
    const bt = Number($('teleBefore')?.value || 0);
    const at = Number($('teleValue')?.value || 0);
    text = `Wide ${signed(bw)} → ${signed(aw)}. Tele ${signed(bt)} → ${signed(at)}. ${lensNumberDisplay()}.`;
  }

  const live = $('liveText');
  if(live) live.textContent = text;
}

function updateCards(){
  const single = isSingle();

  const wideOptDisplay = $('wideOptDisplay');
  const teleOptDisplay = $('teleOptDisplay');
  if(wideOptDisplay){
    wideOptDisplay.textContent = single
      ? ($('singleOptAperture')?.value || 'Not specified')
      : ($('wideOptAperture')?.value || 'Not specified');
  }
  if(teleOptDisplay){
    teleOptDisplay.textContent = single
      ? ''
      : ($('teleOptAperture')?.value || 'Not specified');
  }

  // If result cards exist, update their common IDs without relying on exact markup.
  const ids = {
    beforeWide: single ? $('singleBefore')?.value : $('wideBefore')?.value,
    afterWide: single ? $('singleValue')?.value : $('wideValue')?.value,
    beforeTele: $('teleBefore')?.value,
    afterTele: $('teleValue')?.value
  };

  Object.entries(ids).forEach(([key,val]) => {
    const el = $(key);
    if(el) el.textContent = signed(val);
  });
}

function updateScales(){
  // Keep existing scale code if elements exist, but don't break if missing.
  const single = isSingle();
  const scaleWide = $('scaleWide');
  const scaleTele = $('scaleTele');
  if(scaleWide){
    const val = single ? Number($('singleValue')?.value || 0) : Number($('wideValue')?.value || 0);
    scaleWide.querySelector('b') && (scaleWide.querySelector('b').textContent = single ? 'AF' : 'WIDE');
    const span = scaleWide.querySelector('span');
    if(span) span.textContent = signed(val);
  }
  if(scaleTele){
    scaleTele.style.display = single ? 'none' : '';
    const val = Number($('teleValue')?.value || 0);
    const span = scaleTele.querySelector('span');
    if(span) span.textContent = signed(val);
  }
}

function update(){
  ensureReference(false);
  updateVisibility();
  updateMenu();
  updateLiveText();
  updateCards();
  updateScales();
}

function reportMenuHTML(single, lens, lensNo){
  const modeClass = single ? 'single-mode' : '';
  return `<div class="nikonPdfMenuImageWrap ${modeClass}">
    <img src="nikon-menu-clean.png">
    <div class="nikonPdfModeLabel">${single ? 'AF' : ''}</div>
    <div class="nikonPdfLensTextOnly"><div>${esc(lens)}</div><small>${esc(lensNo)}</small></div>
  </div>`;
}

function generateReport(){
  ensureReference(false);

  const single = isSingle();
  const date = $('reportDate')?.value || todayISO();
  const ref = $('reference')?.value || makeReference();
  const customer = $('customerName')?.value || 'Not supplied';
  const camera = $('cameraName')?.value || 'Not supplied';
  const lens = getLensName();
  const lensNo = lensNumberDisplay();
  const technician = $('technician')?.value || 'Cameracal Services';
  const subjectDistance = single
    ? formatDistance($('singleDistance')?.value)
    : `Wide ${formatDistance($('wideDistance')?.value)} / Tele ${formatDistance($('teleDistance')?.value)}`;
  const reportId = `${ref}-${date.replaceAll('-','')}`;

  const sf = $('singleFocal')?.value || '';
  const wf = $('wideFocal')?.value || '';
  const tf = $('teleFocal')?.value || '';

  const beforeRows = single
    ? `<tr><td><b>Single (${esc(sf)}mm)</b></td><td class="${cls($('singleBefore')?.value)}">${signed($('singleBefore')?.value)}<br><small>${focus($('singleBefore')?.value)}</small></td><td class="${cls($('singleValue')?.value)}">${signed($('singleValue')?.value)}<br><small>${focus($('singleValue')?.value)}</small></td></tr>`
    : `<tr><td><b>Wide (${esc(wf)}mm)</b></td><td class="${cls($('wideBefore')?.value)}">${signed($('wideBefore')?.value)}<br><small>${focus($('wideBefore')?.value)}</small></td><td class="${cls($('wideValue')?.value)}">${signed($('wideValue')?.value)}<br><small>${focus($('wideValue')?.value)}</small></td></tr>
       <tr><td><b>Tele (${esc(tf)}mm)</b></td><td class="${cls($('teleBefore')?.value)}">${signed($('teleBefore')?.value)}<br><small>${focus($('teleBefore')?.value)}</small></td><td class="${cls($('teleValue')?.value)}">${signed($('teleValue')?.value)}<br><small>${focus($('teleValue')?.value)}</small></td></tr>`;

  const resRows = single
    ? `<tr><td><b>Single (${esc(sf)}mm)</b></td><td>${esc($('singleLpBefore')?.value || 'Not specified')}</td><td>${esc($('singleLpAfter')?.value || 'Not specified')}</td></tr>`
    : `<tr><td><b>Wide (${esc(wf)}mm)</b></td><td>${esc($('wideLpBefore')?.value || 'Not specified')}</td><td>${esc($('wideLpAfter')?.value || 'Not specified')}</td></tr>
       <tr><td><b>Tele (${esc(tf)}mm)</b></td><td>${esc($('teleLpBefore')?.value || 'Not specified')}</td><td>${esc($('teleLpAfter')?.value || 'Not specified')}</td></tr>`;

  const optRows = single
    ? `<tr><td><b>Single (${esc(sf)}mm)</b></td><td>${esc($('singleOptAperture')?.value || 'Not specified')}</td></tr>`
    : `<tr><td><b>Wide (${esc(wf)}mm)</b></td><td>${esc($('wideOptAperture')?.value || 'Not specified')}</td></tr>
       <tr><td><b>Tele (${esc(tf)}mm)</b></td><td>${esc($('teleOptAperture')?.value || 'Not specified')}</td></tr>`;

  const finalRows = single
    ? `<p><b>Single (${esc(sf)}mm):</b><br>${signed($('singleValue')?.value)}<br><small>${focus($('singleValue')?.value)}</small></p>`
    : `<p><b>Wide (${esc(wf)}mm):</b><br>${signed($('wideValue')?.value)}<br><small>${focus($('wideValue')?.value)}</small></p><hr><p><b>Tele (${esc(tf)}mm):</b><br>${signed($('teleValue')?.value)}<br><small>${focus($('teleValue')?.value)}</small></p>`;

  const memoryText = lensNo === 'No number assigned'
    ? 'No Nikon lens memory number was assigned; the optimum value has been recorded in this report.'
    : `AF Fine-Tune values have been recorded for ${esc(lensNo)}.`;

  const logo = document.querySelector('.brandLogo')?.src || 'logo.png';

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(ref)} Nikon AF Fine-Tune Report</title>
  <style>
  @page{size:A4 landscape;margin:6mm}
  *{box-sizing:border-box} body{font-family:Arial,sans-serif;margin:0;color:#0d1b2d;font-size:10px}
  .sheet{border:1.5px solid #0e5080;border-radius:8px;padding:10px 12px 28px;position:relative;min-height:190mm}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0e5080;padding-bottom:8px}
  .head img{width:92px;height:auto}.title{text-align:right}.title h1{margin:0;color:#063b70;font-size:22px}.title h2{margin:6px 0 0;font-size:12px}
  .meta{border:1px solid #0e5080;border-radius:5px;margin:10px 0;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:18px}.meta div{display:grid;grid-template-columns:120px 1fr;row-gap:5px}.meta b{color:#063b70}
  .grid{display:grid;grid-template-columns:47% 53%;gap:10px}.block{border:1px solid #c8d7e5;border-radius:4px;overflow:hidden;margin-bottom:8px}.block h3{margin:0;background:#075486;color:white;font-size:11px;padding:5px 8px;text-transform:uppercase}
  table{width:100%;border-collapse:collapse}td,th{border:1px solid #d7e1ea;padding:5px;text-align:center}th{background:#eef5fb;color:#063b70}.red{color:#c82424;font-weight:bold}.green{color:#21823a;font-weight:bold}.neutral{color:#222;font-weight:bold}
  .note{padding:8px;min-height:45px}.menuBox{padding:5px;background:#fff}.final{border:1px solid #2d8a39;background:#eef9ef;border-radius:5px;display:grid;grid-template-columns:55px 1fr 130px;gap:8px;align-items:center;padding:10px}.tick{font-size:32px;color:white;background:#21823a;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center}
  .cert{position:absolute;left:12px;right:12px;bottom:17px;border:1px solid #0e5080;border-radius:5px;padding:9px;display:grid;grid-template-columns:70px 1fr 240px 180px;gap:12px;align-items:center}.footer{position:absolute;bottom:0;left:0;right:0;background:#075486;color:white;display:flex;justify-content:space-between;padding:6px 14px}
  .sig{font-family:cursive;font-size:18px;border-bottom:1px solid #333}
  .nikonPdfMenuImageWrap{position:relative;width:100%;aspect-ratio:1448/1086;background:#000;overflow:hidden}.nikonPdfMenuImageWrap img{width:100%;height:100%;object-fit:contain;display:block}.nikonPdfLensTextOnly{position:absolute;left:7.4%;right:34%;top:67.2%;height:8.2%;color:#fff;overflow:hidden;display:flex;flex-direction:column;justify-content:center}.nikonPdfLensTextOnly div{font-size:5.8pt;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nikonPdfLensTextOnly small{font-size:3.6pt;line-height:1.05;margin-top:.1mm;color:#ddd}.nikonPdfModeLabel{display:none}.nikonPdfMenuImageWrap.single-mode .nikonPdfModeLabel{display:flex;position:absolute;left:5.2%;top:32%;width:12.8%;height:7.6%;background:#000;color:#fff;font-size:8pt;align-items:center;justify-content:center}
  </style></head><body><div class="sheet">
  <div class="head"><img src="${logo}"><div class="title"><h1>Nikon AF Fine-Tune Calibration Report</h1><h2>Cameracal Services</h2></div></div>
  <div class="meta"><div><b>Customer:</b><span>${esc(customer)}</span><b>Date:</b><span>${esc(date)}</span><b>Camera:</b><span>${esc(camera)}</span><b>Lens:</b><span>${esc(lens)}</span><b>Subject Distance:</b><span>${esc(subjectDistance)}</span><b>Saved Lens No:</b><span>${esc(lensNo)}</span></div>
  <div><b>Reference:</b><span>${esc(ref)}</span><b>Technician:</b><span>${esc(technician)}</span><b>Mode:</b><span>${single?'Single':'Wide / Tele'}</span><b>Standard:</b><span>Nikon AF Fine-Tune Procedure v1.0</span><b>Report ID:</b><span>${esc(reportId)}</span></div></div>
  <div class="grid"><div>
  <div class="block"><h3>Before / After AF Fine-Tune Values</h3><table><tr><th>Position</th><th>Before Fine-Tune</th><th>After Fine-Tune</th></tr>${beforeRows}</table></div>
  <div class="block"><h3>Image Resolution Performance (LP/mm)</h3><table><tr><th>Position</th><th>Before calibration</th><th>After calibration</th></tr>${resRows}</table></div>
  <div class="block"><h3>Lens Optimisation Aperture (Recommended)</h3><table><tr><th>Position</th><th>Recommended aperture</th></tr>${optRows}</table></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="block"><h3>Nikon Fine-Tune Note</h3><div class="note">AF Fine-Tune values are saved against the selected Nikon lens memory number.</div></div><div class="block"><h3>Technician Notes</h3><div class="note">${esc($('notes')?.value || 'No additional notes entered.')}</div></div></div>
  </div><div>
  <div class="block"><h3>Nikon AF Fine-Tune Settings</h3><div class="menuBox">${reportMenuHTML(single,lens,lensNo)}</div></div>
  <div class="final"><div class="tick">✓</div><div><h3 style="margin:0 0 5px;color:#21823a">Calibration Successful</h3><p>${memoryText}</p><p><b>The camera and lens combination is now operating within expected calibration tolerance.</b></p></div><div style="border:1px solid #9bd29b;border-radius:4px;padding:6px">${finalRows}</div></div>
  </div></div>
  <div class="cert"><div class="tick">✓</div><div><b>QUALITY CERTIFIED</b><br>This calibration has been performed and verified using Cameracal Services procedures.</div><div><b>Technician Signature:</b><br><div class="sig">Cameracal Services</div>Date: ${esc(date)}</div><div><b>Reference:</b><br>${esc(ref)}<br><br><b>Report ID:</b><br>${esc(reportId)}</div></div>
  <div style="position:absolute;left:14px;right:14px;bottom:34px;font-size:7px;text-align:center;color:#555">Calibration results reflect the tested camera and lens combination under the conditions present at the time of service. Customers are advised to independently verify autofocus accuracy and overall image performance prior to any important event, travel, assignment or commercial work.</div>
  <div class="footer"><span>© Cameracal Services 2026</span><span>www.cameracalservices.co.uk</span><span>Professional Calibration. Accurate Results.</span></div>
  </div></body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

function bindEvents(){
  document.querySelectorAll('input,select,textarea').forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', () => {
      if(el.id === 'reportDate') ensureReference(true);
      update();
    });
  });

  const btn = $('generatePdf') || $('generateReport') || document.querySelector('[data-generate-pdf]');
  if(btn) btn.addEventListener('click', generateReport);
}

document.addEventListener('DOMContentLoaded', () => {
  populateSelects();
  if($('reportDate') && !$('reportDate').value) $('reportDate').value = todayISO();
  ensureReference(true);
  bindEvents();
  update();
});
