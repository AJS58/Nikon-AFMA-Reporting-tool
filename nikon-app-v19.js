/* Nikon AF Fine-Tune Tool v19 - no single overlay */
/* Nikon AF Fine-Tune Tool v18 - single mode clean menu */
/* Nikon AF Fine-Tune Tool v17 - hard live sync patch */
/* Nikon AF Fine-Tune Tool v16 - actual index ID fix */

const $ = id => document.getElementById(id);

function todayISO(){
  return new Date().toISOString().slice(0,10);
}
function signed(v){
  const n = Number(v || 0);
  return n > 0 ? `+${n}` : `${n}`;
}
function focusText(v){
  const n = Number(v || 0);
  if(n > 0) return 'Back focus correction';
  if(n < 0) return 'Front focus correction';
  return 'No correction';
}
function cardClass(v){
  const n = Number(v || 0);
  if(n > 0) return 'back';
  if(n < 0) return 'front';
  return 'neutral';
}
function esc(v){
  return String(v ?? '').replace(/[&<>"']/g, s => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[s]));
}
function makeReference(){
  const d = $('reportDate')?.value || todayISO();
  return `NIK-${d.replaceAll('-','')}-001`;
}
function ensureReference(force=false){
  const ref = $('jobRef');
  if(!ref) return;
  if(force || !ref.value || !/^NIK-\d{8}-\d{3}$/.test(ref.value)){
    ref.value = makeReference();
  }
}
function lensNumberDisplay(){
  const v = $('lensNumber')?.value || 'none';
  return v === 'none' ? 'No number assigned' : `Saved lens No. ${v}`;
}
function isSingle(){
  return $('mode')?.value === 'single';
}
function lensName(){
  return $('lensName')?.value?.trim() || 'Lens';
}
function formatDistance(v){
  if(!v) return 'Not specified';
  return `${String(v).replace('.0','')} m`;
}
function distanceSummary(){
  if(isSingle()) return formatDistance($('singleDistance')?.value);
  return `Wide ${formatDistance($('wideDistance')?.value)} / Tele ${formatDistance($('teleDistance')?.value)}`;
}

function populateDropdowns(){
  const lensSelect = $('lensNumber');
  if(lensSelect){
    lensSelect.innerHTML = '';
    const none = document.createElement('option');
    none.value = 'none';
    none.textContent = 'No number assigned';
    lensSelect.appendChild(none);
    for(let i=1;i<=20;i++){
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = `Lens No. ${i}`;
      lensSelect.appendChild(option);
    }
    lensSelect.value = 'none';
  }

  const distances = ['0.8','0.9','1.0','1.1','1.2','1.3','1.4','1.5','1.6','1.7','1.8','1.9','2.0','2.2','2.4','2.6','2.8','3.0','3.2','3.5','3.8','4.0','4.3','4.5','5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0','10','11','12','13','14','15','16','18','20','22','24'];
  [['wideDistance','1.2'],['teleDistance','4.3'],['singleDistance','4.3']].forEach(([id, def]) => {
    const el = $(id);
    if(!el) return;
    const previous = el.value || def;
    el.innerHTML = '';
    distances.forEach(d => {
      const o = document.createElement('option');
      o.value = d;
      o.textContent = `${String(d).replace('.0','')} m`;
      el.appendChild(o);
    });
    el.value = distances.includes(previous) ? previous : def;
  });

  const apertures = ['','f/1.2','f/1.4','f/1.8','f/2','f/2.5','f/2.8','f/3.2','f/3.5','f/4','f/4.5','f/5','f/5.6','f/6.3','f/7.1','f/8','f/9','f/10','f/11','f/13','f/16'];
  ['wideOptAperture','teleOptAperture','singleOptAperture'].forEach(id => {
    const el = $(id);
    if(!el) return;
    const previous = el.value;
    el.innerHTML = '';
    apertures.forEach(a => {
      const o = document.createElement('option');
      o.value = a;
      o.textContent = a || 'Select aperture';
      el.appendChild(o);
    });
    if(previous) el.value = previous;
  });
}

function setVisibility(){
  const single = isSingle();
  ['wtFocals','distanceWT','optWT','qualityWT','beforeWT','afterWT','scaleTele','teleOptCard'].forEach(id => {
    const el = $(id);
    if(el) el.classList.toggle('hidden', single);
  });
  ['singleFocalWrap','singleDistanceWrap','optSingle','qualitySingle','beforeSingleWrap','afterSingle'].forEach(id => {
    const el = $(id);
    if(el) el.classList.toggle('hidden', !single);
  });
}

function updateMenu(){
  const single = isSingle();
  const menu = $('nikonMenu');
  if(menu) menu.classList.toggle('single-mode', single);

  const lensText = $('nikonLiveLensText');
  if(lensText) lensText.textContent = lensName();

  const lensNo = $('nikonLiveLensNo');
  if(lensNo) lensNo.textContent = lensNumberDisplay();

function updateOutputs(){
  if($('wideOutput')) $('wideOutput').textContent = signed($('wideValue')?.value);
  if($('teleOutput')) $('teleOutput').textContent = signed($('teleValue')?.value);
  if($('singleOutput')) $('singleOutput').textContent = signed($('singleValue')?.value);
}

function updateResultCards(){
  const single = isSingle();

  const values = single ? [
    ['beforeWideCard','Before single',$('beforeSingle')?.value],
    ['wideCard','After single',$('singleValue')?.value],
    ['beforeTeleCard','',null],
    ['teleCard','',null]
  ] : [
    ['beforeWideCard','Before wide',$('beforeWide')?.value],
    ['wideCard','After wide',$('wideValue')?.value],
    ['beforeTeleCard','Before tele',$('beforeTele')?.value],
    ['teleCard','After tele',$('teleValue')?.value]
  ];

  values.forEach(([id,label,val]) => {
    const card = $(id);
    if(!card) return;
    if(val === null){
      card.style.display = 'none';
      return;
    }
    card.style.display = '';
    card.className = cardClass(val);
    const span = card.querySelector('span');
    const strong = card.querySelector('strong');
    const small = card.querySelector('small');
    if(span) span.textContent = label;
    if(strong) strong.textContent = signed(val);
    if(small) small.textContent = focusText(val);
  });
}

function updateOptimisation(){
  if($('wideOptDisplay')){
    $('wideOptDisplay').textContent = isSingle()
      ? ($('singleOptAperture')?.value || 'Not specified')
      : ($('wideOptAperture')?.value || 'Not specified');
  }
  if($('teleOptDisplay')){
    $('teleOptDisplay').textContent = isSingle()
      ? ''
      : ($('teleOptAperture')?.value || 'Not specified');
  }
}

function updateScaleLabels(){
  const single = isSingle();
  const scaleWide = $('scaleWide');
  const scaleTele = $('scaleTele');
  if(scaleWide){
    const b = scaleWide.querySelector('b');
    const span = scaleWide.querySelector('span');
    if(b) b.textContent = single ? 'AF' : 'WIDE';
    if(span) span.textContent = single ? signed($('singleValue')?.value) : signed($('wideValue')?.value);
  }
  if(scaleTele){
    scaleTele.classList.toggle('hidden', single);
    const span = scaleTele.querySelector('span');
    if(span) span.textContent = signed($('teleValue')?.value);
  }
}

function updateResultLine(){
  const line = $('resultLine');
  if(!line) return;
  if(isSingle()){
    line.textContent = `Single ${signed($('beforeSingle')?.value)} → ${signed($('singleValue')?.value)}. ${lensNumberDisplay()}.`;
  } else {
    line.textContent = `Wide ${signed($('beforeWide')?.value)} → ${signed($('wideValue')?.value)}. Tele ${signed($('beforeTele')?.value)} → ${signed($('teleValue')?.value)}. ${lensNumberDisplay()}.`;
  }
}

function update(){
  ensureReference(false);
  setVisibility();
  updateMenu();
  updateOutputs();
  updateResultCards();
  updateOptimisation();
  updateScaleLabels();
  updateResultLine();
}

function lp(v){
  return v ? `${esc(v)} LP/mm` : 'Not specified';
}
function opt(v){
  return v || 'Not specified';
}

function reportMenuHTML(){
  const cls = isSingle() ? 'single-mode' : '';
  return `<div class="nikonPdfMenuImageWrap ${cls}">
    <img src="nikon-menu-clean.png">
    
    <div class="nikonPdfLensTextOnly"><div>${esc(lensName())}</div><small>${esc(lensNumberDisplay())}</small></div>
  </div>`;
}

function printReport(){
  ensureReference(false);

  const single = isSingle();
  const ref = $('jobRef')?.value || makeReference();
  const date = $('reportDate')?.value || todayISO();
  const customer = $('customerName')?.value || 'Not supplied';
  const camera = $('cameraDescription')?.value || 'Not supplied';
  const lens = lensName();
  const lensNo = lensNumberDisplay();
  const technician = $('technicianName')?.value || 'Cameracal Services';
  const reportId = `${ref}-${date.replaceAll('-','')}`;
  const logo = document.querySelector('.brandLogo')?.src || 'logo.png';

  const sf = $('singleFocal')?.value || '105';
  const wf = $('wideFocal')?.value || '70';
  const tf = $('teleFocal')?.value || '200';

  const rows = single
    ? `<tr><td><b>Single (${esc(sf)}mm)</b></td><td class="${cardClass($('beforeSingle')?.value)}">${signed($('beforeSingle')?.value)}<br><small>${focusText($('beforeSingle')?.value)}</small></td><td class="${cardClass($('singleValue')?.value)}">${signed($('singleValue')?.value)}<br><small>${focusText($('singleValue')?.value)}</small></td></tr>`
    : `<tr><td><b>Wide (${esc(wf)}mm)</b></td><td class="${cardClass($('beforeWide')?.value)}">${signed($('beforeWide')?.value)}<br><small>${focusText($('beforeWide')?.value)}</small></td><td class="${cardClass($('wideValue')?.value)}">${signed($('wideValue')?.value)}<br><small>${focusText($('wideValue')?.value)}</small></td></tr>
       <tr><td><b>Tele (${esc(tf)}mm)</b></td><td class="${cardClass($('beforeTele')?.value)}">${signed($('beforeTele')?.value)}<br><small>${focusText($('beforeTele')?.value)}</small></td><td class="${cardClass($('teleValue')?.value)}">${signed($('teleValue')?.value)}<br><small>${focusText($('teleValue')?.value)}</small></td></tr>`;

  const lpRows = single
    ? `<tr><td><b>Single (${esc(sf)}mm)</b></td><td>${lp($('singleLPBefore')?.value)}</td><td>${lp($('singleLPAfter')?.value)}</td></tr>`
    : `<tr><td><b>Wide (${esc(wf)}mm)</b></td><td>${lp($('wideLPBefore')?.value)}</td><td>${lp($('wideLPAfter')?.value)}</td></tr>
       <tr><td><b>Tele (${esc(tf)}mm)</b></td><td>${lp($('teleLPBefore')?.value)}</td><td>${lp($('teleLPAfter')?.value)}</td></tr>`;

  const optRows = single
    ? `<tr><td><b>Single (${esc(sf)}mm)</b></td><td>${esc(opt($('singleOptAperture')?.value))}</td></tr>`
    : `<tr><td><b>Wide (${esc(wf)}mm)</b></td><td>${esc(opt($('wideOptAperture')?.value))}</td></tr>
       <tr><td><b>Tele (${esc(tf)}mm)</b></td><td>${esc(opt($('teleOptAperture')?.value))}</td></tr>`;

  const finalValue = single
    ? `<b>Single (${esc(sf)}mm):</b><br>${signed($('singleValue')?.value)}<br><small>${focusText($('singleValue')?.value)}</small>`
    : `<b>Wide (${esc(wf)}mm):</b><br>${signed($('wideValue')?.value)}<br><small>${focusText($('wideValue')?.value)}</small><hr><b>Tele (${esc(tf)}mm):</b><br>${signed($('teleValue')?.value)}<br><small>${focusText($('teleValue')?.value)}</small>`;

  const memoryLine = lensNo === 'No number assigned'
    ? 'No Nikon lens memory number was assigned; the optimum value has been recorded in this report.'
    : `AF Fine-Tune values have been recorded for ${esc(lensNo)}.`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(ref)} Nikon AF Fine-Tune Report</title>
<style>
@page{size:A4 landscape;margin:5mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;color:#101827;font-size:10px}.sheet{height:200mm;border:1.5px solid #0f4c81;border-radius:8px;padding:10px 12px 30px;position:relative;overflow:hidden}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f4c81;padding-bottom:8px}.header img{width:95px}.title{text-align:right;color:#0f3970}.title h1{margin:0;font-size:22px}.title h2{margin:5px 0 0;font-size:12px}.info{margin-top:8px;border:1px solid #0f4c81;border-radius:5px;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:16px}.info div{display:grid;grid-template-columns:115px 1fr;row-gap:4px}.info b{color:#0f3970}.main{margin-top:8px;display:grid;grid-template-columns:47% 53%;gap:9px}.block{border:1px solid #c8d6e2;border-radius:4px;overflow:hidden;margin-bottom:7px}.block h3{margin:0;background:#0f4c81;color:white;font-size:10px;padding:5px 7px;text-transform:uppercase}table{width:100%;border-collapse:collapse}td,th{border:1px solid #d7e0e8;padding:5px;text-align:center}th{background:#eef5fb;color:#0b3770}td:first-child,th:first-child{text-align:left}.front{color:#c62828;font-weight:bold}.back{color:#2e7d32;font-weight:bold}.neutral{color:#455a64;font-weight:bold}.note{padding:7px;min-height:42px}.menuBox{padding:4px;background:#fff}.nikonPdfMenuImageWrap{position:relative;width:100%;aspect-ratio:1448/1086;background:#000;overflow:hidden}.nikonPdfMenuImageWrap img{width:100%;height:100%;object-fit:contain;display:block}.nikonPdfLensTextOnly{position:absolute;left:7.4%;right:34.0%;top:67.2%;height:8.2%;color:#fff;background:transparent;overflow:hidden;display:flex;flex-direction:column;justify-content:center}.nikonPdfLensTextOnly div{font-size:5.8pt;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nikonPdfLensTextOnly small{font-size:3.6pt;line-height:1.05;margin-top:.1mm;color:#ddd}.nikonPdfModeLabel{display:none}.nikonPdfMenuImageWrap.single-mode .nikonPdfModeLabel{display:flex;position:absolute;left:5.0%;top:32.2%;width:14.0%;height:8.5%;background:#000;color:#fff;font-size:8pt;align-items:center;justify-content:center}.final{border:1px solid #2e7d32;background:#f4fbf2;border-radius:5px;display:grid;grid-template-columns:45px 1fr 115px;gap:8px;padding:9px;align-items:center}.check{background:#2e7d32;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold}.final h4{margin:0 0 4px;color:#2e7d32}.finalVals{background:white;border:1px solid #95c788;border-radius:4px;padding:5px}.cert{position:absolute;left:12px;right:12px;bottom:17px;border:1px solid #0f4c81;border-radius:5px;padding:7px;display:grid;grid-template-columns:45px 1fr 220px 175px;gap:10px;align-items:center}.sig{font-family:cursive;font-size:18px;border-bottom:1px solid #222}.disclaimer{position:absolute;left:15px;right:15px;bottom:36px;font-size:7px;color:#555;text-align:center}.footer{position:absolute;left:0;right:0;bottom:0;background:#0f4c81;color:white;display:flex;justify-content:space-between;padding:6px 12px}
</style></head><body><div class="sheet">
<div class="header"><img src="${logo}"><div class="title"><h1>Nikon AF Fine-Tune Calibration Report</h1><h2>Cameracal Services</h2></div></div>
<div class="info"><div><b>Customer:</b><span>${esc(customer)}</span><b>Date:</b><span>${esc(date)}</span><b>Camera:</b><span>${esc(camera)}</span><b>Lens:</b><span>${esc(lens)}</span><b>Subject Distance:</b><span>${esc(distanceSummary())}</span><b>Saved Lens No:</b><span>${esc(lensNo)}</span></div><div><b>Reference:</b><span>${esc(ref)}</span><b>Technician:</b><span>${esc(technician)}</span><b>Mode:</b><span>${single?'Single':'Wide / Tele'}</span><b>Standard:</b><span>Nikon AF Fine-Tune Procedure v1.0</span><b>Report ID:</b><span>${esc(reportId)}</span></div></div>
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
</div><script>setTimeout(()=>window.print(),350)</script></body></html>`;

  const win = window.open('', '_blank');
  if(!win){ alert('Please allow pop-ups to generate the PDF report.'); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function bind(){
  document.querySelectorAll('input,select,textarea').forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', () => {
      if(el.id === 'reportDate') ensureReference(true);
      update();
    });
  });
  document.querySelectorAll('button[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = $(btn.dataset.target);
      if(!target) return;
      const step = Number(btn.dataset.step || 0);
      const min = Number(target.min || -20);
      const max = Number(target.max || 20);
      target.value = Math.max(min, Math.min(max, Number(target.value || 0) + step));
      update();
    });
  });
  if($('pdfBtn')) $('pdfBtn').addEventListener('click', printReport);
}

document.addEventListener('DOMContentLoaded', () => {
  populateDropdowns();
  if($('reportDate') && !$('reportDate').value) $('reportDate').value = todayISO();
  ensureReference(true);
  bind();
  update();
});


/* v17 HARD LIVE SYNC PATCH
   Directly binds to actual HTML IDs:
   jobRef, reportDate, lensName, lensNumber, mode, nikonLiveLensText, nikonLiveLensNo, nikonMenu.
*/
(function(){
  const $ = (id) => document.getElementById(id);

  function todayISO(){
    return new Date().toISOString().slice(0,10);
  }

  function makeReference(){
    const date = $('reportDate')?.value || todayISO();
    return `NIK-${date.replaceAll('-','')}-001`;
  }

  function lensNumberText(){
    const value = $('lensNumber')?.value || 'none';
    return value === 'none' ? 'No number assigned' : `Saved lens No. ${value}`;
  }

  function isSingleMode(){
    return $('mode')?.value === 'single';
  }

  function hardSync(){
    // 1. Auto reference number
    const ref = $('jobRef');
    if(ref && (!ref.value || !/^NIK-\d{8}-\d{3}$/.test(ref.value))){
      ref.value = makeReference();
    }

    // 2. Lens name live update
    const lensName = $('lensName')?.value?.trim() || 'Lens';
    const lensTarget = $('nikonLiveLensText');
    if(lensTarget && lensTarget.textContent !== lensName){
      lensTarget.textContent = lensName;
    }

    // 3. Lens number live update
    const lensNo = lensNumberText();
    const lensNoTarget = $('nikonLiveLensNo');
    if(lensNoTarget && lensNoTarget.textContent !== lensNo){
      lensNoTarget.textContent = lensNo;
    }

    // 4. Single mode live menu update
    const single = isSingleMode();
    const menu = $('nikonMenu');
    if(menu){
      menu.classList.toggle('single-mode', single);
    }
  }

  function bindHardSync(){
    document.addEventListener('input', hardSync, true);
    document.addEventListener('change', hardSync, true);
    document.addEventListener('keyup', hardSync, true);
    document.addEventListener('click', function(){
      setTimeout(hardSync, 0);
      setTimeout(hardSync, 100);
    }, true);

    const date = $('reportDate');
    if(date){
      date.addEventListener('change', function(){
        const ref = $('jobRef');
        if(ref) ref.value = makeReference();
        hardSync();
      }, true);
    }

    hardSync();
    setTimeout(hardSync, 100);
    setTimeout(hardSync, 300);
    setTimeout(hardSync, 800);
    setTimeout(hardSync, 1500);

    // For GitHub/browser timing issues: keep alive, but light.
    let count = 0;
    const timer = setInterval(function(){
      hardSync();
      count++;
      if(count > 20) clearInterval(timer);
    }, 500);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindHardSync);
  } else {
    bindHardSync();
  }
})();


/* v18 single-mode clean patch:
   Do not draw AF/WIDE/TELE overlays over the Nikon image menu. */
(function(){
  function cleanSingleOverlay(){
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', cleanSingleOverlay);
  } else {
    cleanSingleOverlay();
  }
  document.addEventListener('input', cleanSingleOverlay, true);
  document.addEventListener('change', cleanSingleOverlay, true);
  document.addEventListener('click', () => setTimeout(cleanSingleOverlay, 0), true);
  setTimeout(cleanSingleOverlay, 100);
  setTimeout(cleanSingleOverlay, 500);
})();


/* v19 final hard sync: reference + lens label only. No single-mode overlay at all. */
(function(){
  const $ = id => document.getElementById(id);

  function todayISO(){
    return new Date().toISOString().slice(0,10);
  }

  function makeReference(){
    const d = $('reportDate')?.value || todayISO();
    return `NIK-${d.replaceAll('-','')}-001`;
  }

  function lensNumberText(){
    const v = $('lensNumber')?.value || 'none';
    return v === 'none' ? 'No number assigned' : `Saved lens No. ${v}`;
  }

  function sync(){
    const ref = $('jobRef');
    if(ref && (!ref.value || !/^NIK-\d{8}-\d{3}$/.test(ref.value))){
      ref.value = makeReference();
    }

    const lens = $('lensName')?.value?.trim() || 'Lens';
    const lensTarget = $('nikonLiveLensText');
    if(lensTarget) lensTarget.textContent = lens;

    const noTarget = $('nikonLiveLensNo');
    if(noTarget) noTarget.textContent = lensNumberText();
  }

  function bind(){
    document.addEventListener('input', sync, true);
    document.addEventListener('change', sync, true);
    document.addEventListener('keyup', sync, true);
    const date = $('reportDate');
    if(date){
      date.addEventListener('change', function(){
        const ref = $('jobRef');
        if(ref) ref.value = makeReference();
        sync();
      }, true);
    }
    sync();
    setTimeout(sync,100);
    setTimeout(sync,500);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
