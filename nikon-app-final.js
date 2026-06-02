/* Nikon AF Fine-Tune Tool - final six-file build */
'use strict';

const IMG_WIDE = 'nikon-menu-clean.png';
const IMG_SINGLE = 'nikon-menu-clean.png';
const LOGO_SRC = 'logo.png';

const $ = id => document.getElementById(id);

function todayISO() { return new Date().toISOString().slice(0,10); }
function signed(v) { const n = Number(v || 0); return n > 0 ? `+${n}` : `${n}`; }
function focusText(v) { const n = Number(v || 0); if(n > 0) return 'Back focus'; if(n < 0) return 'Front focus'; return 'No correction'; }
function focusClass(v) { const n = Number(v || 0); if(n > 0) return 'back'; if(n < 0) return 'front'; return 'neutral'; }
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
function isSingle() { return $('mode').value === 'single'; }
function makeRef() { return `NIK-${$('reportDate').value.replaceAll('-','')}-001`; }
function lensNumberText() { const v = $('lensNumber').value; return v === 'none' ? 'No number assigned' : `Saved lens No. ${v}`; }
function lensName() { return $('lensName').value.trim() || 'Lens'; }
function metres(v) { return `${String(v).replace('.0','')} m`; }

function populate() {
  $('reportDate').value = $('reportDate').value || todayISO();
  $('jobRef').value = makeRef();

  $('lensNumber').innerHTML = '<option value="none">No number assigned</option>' + Array.from({length:20},(_,i)=>`<option value="${i+1}">Lens No. ${i+1}</option>`).join('');

  const distances = ['0.8','0.9','1.0','1.1','1.2','1.3','1.4','1.5','1.6','1.7','1.8','1.9','2.0','2.2','2.4','2.6','2.8','3.0','3.2','3.5','3.8','4.0','4.3','4.5','5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0','10','11','12','13','14','15','16','18','20','22','24'];
  for(const id of ['wideDistance','teleDistance','singleDistance']) {
    const def = id === 'wideDistance' ? '1.2' : '4.3';
    $(id).innerHTML = distances.map(d=>`<option value="${d}">${metres(d)}</option>`).join('');
    $(id).value = def;
  }

  const apertures = ['','f/1.2','f/1.4','f/1.8','f/2','f/2.5','f/2.8','f/3.2','f/3.5','f/4','f/4.5','f/5','f/5.6','f/6.3','f/7.1','f/8','f/9','f/10','f/11','f/13','f/16'];
  for(const id of ['wideOptAperture','teleOptAperture','singleOptAperture']) {
    $(id).innerHTML = apertures.map(a=>`<option value="${a}">${a || 'Select aperture'}</option>`).join('');
  }
}

function setHidden(id, hide) { const el = $(id); if(el) el.classList.toggle('hidden', hide); }

function updateCard(id,label,value,show=true) {
  const el = $(id); if(!el) return;
  el.style.display = show ? '' : 'none';
  if(!show) return;
  el.className = 'pill ' + focusClass(value);
  el.querySelector('span').textContent = label;
  el.querySelector('strong').textContent = signed(value);
  el.querySelector('small').textContent = focusText(value);
}

function setPointer(rowId,value) {
  const row = $(rowId); if(!row) return;
  const ptr = row.querySelector('.ptr');
  const span = row.querySelector('span');
  const pos = ((Number(value || 0)+20)/40)*100;
  ptr.style.left = `${pos}%`;
  span.textContent = signed(value);
}

function update() {
  const single = isSingle();

  if(!$('jobRef').value) $('jobRef').value = makeRef();

  setHidden('wtFocals', single);
  setHidden('distanceWT', single);
  setHidden('optWT', single);
  setHidden('qualityWT', single);
  setHidden('beforeWT', single);
  setHidden('afterWT', single);

  setHidden('singleFocalWrap', !single);
  setHidden('singleDistanceWrap', !single);
  setHidden('optSingle', !single);
  setHidden('qualitySingle', !single);
  setHidden('beforeSingleWrap', !single);
  setHidden('afterSingle', !single);

  $('nikonMenuImage').src = IMG_WIDE;
  $('nikonLiveLensText').textContent = lensName();
  $('nikonLiveLensNo').textContent = lensNumberText();

  if(single) {
    $('resultLine').textContent = `Single ${signed($('beforeSingle').value)} → ${signed($('singleValue').value)}. ${lensNumberText()}.`;
    updateCard('beforeWideCard','Before single',$('beforeSingle').value,true);
    updateCard('wideCard','After single',$('singleValue').value,true);
    updateCard('beforeTeleCard','',0,false);
    updateCard('teleCard','',0,false);
    $('wideOptTitle').textContent = 'Single optimum aperture';
    $('wideOptDisplay').textContent = $('singleOptAperture').value || 'Not specified';
    setHidden('teleOptCard', true);
    $('scaleWide').querySelector('b').textContent = 'AF';
    setPointer('scaleWide',$('singleValue').value);
    setHidden('scaleTele', true);
  } else {
    $('resultLine').textContent = `Wide ${signed($('beforeWide').value)} → ${signed($('wideValue').value)}. Tele ${signed($('beforeTele').value)} → ${signed($('teleValue').value)}. ${lensNumberText()}.`;
    updateCard('beforeWideCard','Before wide',$('beforeWide').value,true);
    updateCard('wideCard','After wide',$('wideValue').value,true);
    updateCard('beforeTeleCard','Before tele',$('beforeTele').value,true);
    updateCard('teleCard','After tele',$('teleValue').value,true);
    $('wideOptTitle').textContent = 'Wide optimum aperture';
    $('wideOptDisplay').textContent = $('wideOptAperture').value || 'Not specified';
    $('teleOptDisplay').textContent = $('teleOptAperture').value || 'Not specified';
    setHidden('teleOptCard', false);
    $('scaleWide').querySelector('b').textContent = 'WIDE';
    setPointer('scaleWide',$('wideValue').value);
    setHidden('scaleTele', false);
    setPointer('scaleTele',$('teleValue').value);
  }
}

function reportMenuHTML() {
  const img = isSingle() ? IMG_SINGLE : IMG_WIDE;
  return `<div class="pdfMenu"><img src="${img}"><div class="pdfLens"><div>${esc(lensName())}</div><small>${esc(lensNumberText())}</small></div></div>`;
}

function printReport() {
  const single = isSingle();
  const ref = $('jobRef').value || makeRef();
  const date = $('reportDate').value;
  const customer = $('customerName').value || 'Not supplied';
  const camera = $('cameraDescription').value || 'Not supplied';
  const lens = lensName();
  const lensNo = lensNumberText();
  const tech = $('technicianName').value || 'Cameracal Services';
  const reportId = `${ref}-${date.replaceAll('-','')}`;
  const dist = single ? metres($('singleDistance').value) : `Wide ${metres($('wideDistance').value)} / Tele ${metres($('teleDistance').value)}`;
  const sf = $('singleFocal').value, wf = $('wideFocal').value, tf = $('teleFocal').value;

  const rows = single
    ? `<tr><td>Single (${esc(sf)}mm)</td><td>${signed($('beforeSingle').value)}<br>${focusText($('beforeSingle').value)}</td><td>${signed($('singleValue').value)}<br>${focusText($('singleValue').value)}</td></tr>`
    : `<tr><td>Wide (${esc(wf)}mm)</td><td>${signed($('beforeWide').value)}<br>${focusText($('beforeWide').value)}</td><td>${signed($('wideValue').value)}<br>${focusText($('wideValue').value)}</td></tr><tr><td>Tele (${esc(tf)}mm)</td><td>${signed($('beforeTele').value)}<br>${focusText($('beforeTele').value)}</td><td>${signed($('teleValue').value)}<br>${focusText($('teleValue').value)}</td></tr>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(ref)} Nikon Report</title>
<style>
@page{size:A4 landscape;margin:5mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;color:#102033;font-size:10px}.sheet{height:200mm;border:1.5px solid #0f4c81;border-radius:8px;padding:10px 12px 30px;position:relative;overflow:hidden}.header{display:flex;justify-content:space-between;border-bottom:2px solid #0f4c81;padding-bottom:8px}.header img{width:95px}.title{text-align:right;color:#0f3970}.title h1{margin:0;font-size:22px}.info{margin-top:8px;border:1px solid #0f4c81;border-radius:5px;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:16px}.info div{display:grid;grid-template-columns:120px 1fr;row-gap:4px}.info b{color:#0f3970}.main{margin-top:8px;display:grid;grid-template-columns:47% 53%;gap:9px}.block{border:1px solid #c8d6e2;border-radius:4px;overflow:hidden;margin-bottom:7px}.block h3{margin:0;background:#0f4c81;color:white;font-size:10px;padding:5px 7px;text-transform:uppercase}table{width:100%;border-collapse:collapse}td,th{border:1px solid #d7e0e8;padding:5px;text-align:center}th{background:#eef5fb;color:#0b3770}.pdfMenu{position:relative;width:100%;aspect-ratio:1448/1086;background:#000;overflow:hidden}.pdfMenu img{width:100%;height:100%;object-fit:contain;display:block}.pdfLens{position:absolute;left:7.4%;right:34%;top:67.2%;height:8.2%;color:#fff;display:flex;flex-direction:column;justify-content:center;overflow:hidden}.pdfLens div{font-size:5.8pt;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pdfLens small{font-size:3.6pt;color:#ddd}.final{border:1px solid #2e7d32;background:#f4fbf2;border-radius:5px;padding:9px;margin-top:8px}.cert{position:absolute;left:12px;right:12px;bottom:17px;border:1px solid #0f4c81;border-radius:5px;padding:8px;display:grid;grid-template-columns:1fr 220px 170px;gap:10px}.footer{position:absolute;left:0;right:0;bottom:0;background:#0f4c81;color:white;display:flex;justify-content:space-between;padding:6px 12px}
</style></head><body><div class="sheet">
<div class="header"><img src="${LOGO_SRC}"><div class="title"><h1>Nikon AF Fine-Tune Calibration Report</h1><h2>Cameracal Services</h2></div></div>
<div class="info"><div><b>Customer:</b><span>${esc(customer)}</span><b>Date:</b><span>${esc(date)}</span><b>Camera:</b><span>${esc(camera)}</span><b>Lens:</b><span>${esc(lens)}</span><b>Subject Distance:</b><span>${esc(dist)}</span><b>Saved Lens No:</b><span>${esc(lensNo)}</span></div><div><b>Reference:</b><span>${esc(ref)}</span><b>Technician:</b><span>${esc(tech)}</span><b>Mode:</b><span>${single?'Single':'Wide / Tele'}</span><b>Report ID:</b><span>${esc(reportId)}</span></div></div>
<div class="main"><div><div class="block"><h3>Before / After AF Fine-Tune Values</h3><table><tr><th>Position</th><th>Before</th><th>After</th></tr>${rows}</table></div><div class="block"><h3>Technician Notes</h3><div style="padding:8px">${esc($('techNotes').value || 'No additional notes entered.')}</div></div></div><div><div class="block"><h3>Nikon AF Fine-Tune Settings</h3><div style="padding:4px">${reportMenuHTML()}</div></div><div class="final"><b>Calibration Successful</b><br>${lensNo === 'No number assigned' ? 'No Nikon lens memory number was assigned; the optimum value has been recorded in this report.' : 'AF Fine-Tune values have been recorded for ' + esc(lensNo) + '.'}</div></div></div>
<div class="cert"><div><b>QUALITY CERTIFIED</b><br>This calibration has been performed and verified using Cameracal Services procedures.</div><div><b>Technician Signature:</b><br>${esc(tech)}<br>Date: ${esc(date)}</div><div><b>Reference:</b><br>${esc(ref)}<br><br><b>Report ID:</b><br>${esc(reportId)}</div></div>
<div class="footer"><span>© Cameracal Services 2026</span><span>www.cameracalservices.co.uk</span><span>Professional Calibration. Accurate Results.</span></div>
</div><script>setTimeout(()=>window.print(),300)</script></body></html>`;

  const win = window.open('', '_blank');
  if(!win){alert('Please allow pop-ups to generate the PDF report.'); return;}
  win.document.open(); win.document.write(html); win.document.close();
}

function bind() {
  document.querySelectorAll('input,select,textarea').forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });
  $('reportDate').addEventListener('change', () => { $('jobRef').value = makeRef(); update(); });
  document.querySelectorAll('button[data-target]').forEach(btn => btn.addEventListener('click', () => {
    const target = $(btn.dataset.target);
    target.value = Math.max(Number(target.min), Math.min(Number(target.max), Number(target.value)+Number(btn.dataset.step)));
    update();
  }));
  $('pdfBtn').addEventListener('click', printReport);
}

document.addEventListener('DOMContentLoaded', () => {
  populate();
  bind();
  update();
});