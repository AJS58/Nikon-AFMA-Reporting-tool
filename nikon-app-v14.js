/* Nikon AF Fine-Tune Tool v14 - reference, lens number, single focal menu fixes */
/* Nikon AF Fine-Tune Tool v13 - forced clean image menu, old label removed */
/* Nikon AF Fine-Tune Tool v12 - restored original image menu, corrected label + PDF */
/* Nikon AF Fine-Tune Tool v10 - clean text-only lens label + full PDF menu */
/* Nikon AF Fine-Tune Tool v8 - refined live lens label and no-number option */
/* Nikon AF Fine-Tune Tool v7 - live lens label overlay correction */
/* Nikon AF Fine-Tune Tool v6 - dual subject distance dropdowns only */
/* Nikon AF Fine-Tune Tool v5 approved static menu image */
/* Nikon AF Fine-Tune Tool v4 image-based approved menu */
const $=id=>document.getElementById(id);
function signed(v){v=Number(v||0);return v>0?`+${v}`:`${v}`}
function pos(v){return ((Number(v||0)+20)/40)*100}
function focus(v){v=Number(v||0);return v>0?'Back focus correction':v<0?'Front focus correction':'No correction'}
function cls(v){v=Number(v||0);return v>0?'back':v<0?'front':'neutral'}
function ap(v){return v&&String(v).trim()?String(v):'Not specified'}
function esc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))}
function lp(v){return v?`${esc(v)} LP/mm`:'Not specified'}

const apertureOptions=['','f/1.2','f/1.4','f/1.8','f/2','f/2.5','f/2.8','f/3.2','f/3.5','f/4','f/4.5','f/5','f/5.6','f/6.3','f/7.1','f/8','f/9','f/10','f/11','f/13','f/16'];
function populate(){
  ['wideOptAperture','teleOptAperture','singleOptAperture'].forEach(id=>{
    const s=$(id); s.innerHTML='';
    apertureOptions.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v||'Select aperture';s.appendChild(o)})
  });
  const lens=$('lensNumber'); lens.innerHTML='';
  const none=document.createElement('option');
  none.value='none';
  none.textContent='No number assigned';
  lens.appendChild(none);
  for(let i=1;i<=20;i++){const o=document.createElement('option');o.value=i;o.textContent=`Lens No. ${i}`;lens.appendChild(o)}
  lens.value='none';
}

const distanceOptions=[
  0.8,0.9,1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,
  2.0,2.2,2.4,2.6,2.8,3.0,3.2,3.5,3.8,4.0,4.3,4.5,
  5.0,5.5,6.0,6.5,7.0,7.5,8.0,8.5,9.0,10,11,12,13,14,15,16,18,20,22,24
];

function formatMetres(v){
  const n=Number(v || 0);
  return Number.isInteger(n) ? `${n} m` : `${n.toFixed(1)} m`;
}

function populateDistances(){
  ['wideDistance','teleDistance','singleDistance'].forEach(id=>{
    const s=$(id);
    if(!s) return;
    s.innerHTML='';
    distanceOptions.forEach(v=>{
      const o=document.createElement('option');
      o.value=String(v);
      o.textContent=formatMetres(v);
      s.appendChild(o);
    });
  });

  if($('wideDistance')) $('wideDistance').value='1.2';
  if($('teleDistance')) $('teleDistance').value='4.3';
  if($('singleDistance')) $('singleDistance').value='4.3';
}

function distanceSummary(single){
  if(single){
    return formatMetres($('singleDistance')?.value || 4.3);
  }
  return `Wide ${formatMetres($('wideDistance')?.value || 1.2)} / Tele ${formatMetres($('teleDistance')?.value || 4.3)}`;
}
function tickHTML(value){
  let ticks='';
  for(let n=-20;n<=20;n++){
    const cl=n===0?' zero':(n%10===0?' major':'');
    ticks+=`<i class="tick${cl}" style="left:${pos(n)}%"></i>`;
  }
  return `${ticks}<b class="ptr" style="left:${pos(value)}%"></b>`;
}
function nikonRow(label,value,tele=false){
  return `<div class="nikonRow ${tele?'tele':''}"><div><div class="nikonLabel">${label}</div><div class="nikonValue">${signed(value)}</div></div><div class="nikonScaleBox"><div class="nikonNums"><span>-20</span><span>0</span><span>+20</span></div><div class="nikonRail">${tickHTML(value)}</div></div></div>`;
}
function card(id,v){const e=$(id); if(!e)return; e.className=cls(v); e.querySelector('strong').textContent=signed(v); e.querySelector('small').textContent=focus(v)}
function setScale(id,label,value){const r=$(id); if(!r)return; r.querySelector('b').textContent=label; r.querySelector('.bigRail').innerHTML=tickHTML(value); r.querySelector('span').textContent=signed(value)}

function lensNumberDisplay(){
  const v=$('lensNumber')?.value || 'none';
  return v==='none' ? 'No number assigned' : `Saved lens No. ${v}`;
}`;
}


function makeReference(){
  const d=$('reportDate')?.value || new Date().toISOString().slice(0,10);
  const compact=d.replaceAll('-','');
  return `NIK-${compact}-001`;
}
function ensureReference(){
  const ref=$('reference');
  if(ref && (!ref.value || !/^NIK-\d{8}-\d{3}$/.test(ref.value))){
    ref.value=makeReference();
  }
}

function update(){
  ensureReference();
  const single=$('mode').value==='single';
  const liveLens=$('nikonLiveLensText');
  if(liveLens) liveLens.textContent=$('lensName')?.value || 'Lens';
  const liveLensNo=$('nikonLiveLensNo');
  if(liveLensNo) liveLensNo.textContent=lensNumberDisplay();
  const nikonMenu=$('nikonMenu');
  if(nikonMenu) nikonMenu.classList.toggle('single-mode', single);

  document.querySelectorAll('input,select,textarea').forEach(e=>{e.addEventListener('input',update);e.addEventListener('change',update);});
  document.querySelectorAll('button[data-target]').forEach(b=>b.addEventListener('click',()=>{const t=$(b.dataset.target);t.value=Math.max(+t.min,Math.min(+t.max,+t.value+Number(b.dataset.step)));update()}));
  $('pdfBtn').addEventListener('click',printReport);
  update();
}

function printReport(){
  update();
  const single=$('mode').value==='single';
  const ref=$('jobRef').value||'Nikon-Report', date=$('reportDate').value||new Date().toISOString().slice(0,10);
  const technician=$('technicianName').value||'Cameracal Services';
  const customer=$('customerName').value||'Not supplied', cameraDesc=$('cameraDescription').value||'Not supplied', lens=$('lensName').value||'Not supplied';
  const lensNo=lensNumberDisplay();
  const wf=single?(+$('singleFocal').value||200):+$('wideFocal').value||70, tf=single?null:(+$('teleFocal').value||200);
  const bw=single?(+$('beforeSingle').value||0):+$('beforeWide').value||0, bt=single?null:(+$('beforeTele').value||0);
  const aw=single?(+$('singleValue').value||0):+$('wideValue').value||0, at=single?null:(+$('teleValue').value||0);
  const wideOpt=single?ap($('singleOptAperture').value):ap($('wideOptAperture').value), teleOpt=single?'':ap($('teleOptAperture').value);
  const logo=document.querySelector('.brandLogo').src;
  const menuHTML=`<div class="nikonPdfMenuImageWrap ${single ? 'single-mode' : ''}"><img src="nikon-menu-clean.png"><div class="nikonPdfSingleBadge">AF</div><div class="nikonPdfLensTextOnly"><div>${esc(lens)}</div><small>${esc(lensNo)}</small></div></div>`;
  const reportId=`${ref}-${date.replaceAll('-','')}`;
  const calRows = single ? '' : `<tr><td><b>Tele (${tf}mm)</b></td><td class="${cls(bt)}">${signed(bt)}<br><small>${focus(bt)}</small></td><td class="${cls(at)}">${signed(at)}<br><small>${focus(at)}</small></td></tr>`;
  const lpRows = single ? `<tr><td><b>Single (${wf}mm)</b></td><td>${lp($('singleLPBefore').value)}</td><td>${lp($('singleLPAfter').value)}</td></tr>` : `<tr><td><b>Wide (${wf}mm)</b></td><td>${lp($('wideLPBefore').value)}</td><td>${lp($('wideLPAfter').value)}</td></tr><tr><td><b>Tele (${tf}mm)</b></td><td>${lp($('teleLPBefore').value)}</td><td>${lp($('teleLPAfter').value)}</td></tr>`;
  const optRows = single ? '' : `<tr><td><b>Tele (${tf}mm)</b></td><td>${esc(teleOpt)}</td></tr>`;
  const finalValues = single ? `<b>Single (${wf}mm):</b><br><span class="${cls(aw)}">${signed(aw)}</span><br><small>${focus(aw)}</small>` : `<b>Wide (${wf}mm):</b> <span class="${cls(aw)}">${signed(aw)}</span><br><small>${focus(aw)}</small><hr><b>Tele (${tf}mm):</b> <span class="${cls(at)}">${signed(at)}</span><br><small>${focus(at)}</small>`;
  const report=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(ref)} Nikon AF Fine-Tune Report</title><link rel="stylesheet" href="styles.css"><style>
@page{size:A4 landscape;margin:5mm}body{background:white}.sheet{width:287mm;height:200mm;border:1.7px solid #0f4c81;border-radius:4mm;padding:4.5mm 7mm 0;overflow:hidden;position:relative}.header{height:19mm;display:grid;grid-template-columns:70mm 1fr;align-items:center;border-bottom:1.2px solid #0f4c81}.logo{width:54mm;height:13mm;object-fit:contain}.title{text-align:right;color:#0f3970}.title h1{margin:0;font-size:16pt}.title h2{margin:1.8mm 0 0;font-size:9.5pt}.info{height:30mm;margin-top:2.6mm;border:1px solid #0f4c81;border-radius:2mm;padding:2.2mm 4mm;display:grid;grid-template-columns:1fr 1fr;gap:8mm;font-size:7.2pt}.infoRow{display:grid;grid-template-columns:34mm 1fr;margin-bottom:1.25mm}.infoRow b{color:#0b3770}.content{height:101mm;margin-top:2.5mm;display:grid;grid-template-columns:121mm 1fr;gap:5mm}.block{border:1px solid #c8d6e2;border-radius:1.4mm;overflow:hidden;margin-bottom:1.8mm;background:white}.block h3{margin:0;background:#0f4c81;color:white;padding:1.55mm 2.6mm;font-size:7.8pt;text-transform:uppercase}table{width:100%;border-collapse:collapse;font-size:6.65pt}th,td{border:1px solid #d7e0e8;padding:1.25mm;text-align:center}th{background:#eef5fb;color:#0b3770}td:first-child,th:first-child{text-align:left}.twobox{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.textbox{height:20mm;border:1px solid #c8d6e2;border-radius:1.4mm;overflow:hidden;font-size:6.6pt}.textbox h3{margin:0;background:#0f4c81;color:white;padding:1.35mm 2.4mm;font-size:7.4pt;text-transform:uppercase}.textbox p{margin:0;padding:1.8mm;line-height:1.18}.menuBlock{height:64mm}.menuWrap{height:56mm;background:#000;overflow:hidden}.menuWrap .nikonMenu{width:100%;height:100%;margin:0;border:0;border-radius:0}.menuWrap .nikonTop{font-size:16pt}.menuWrap .nikonLabel{font-size:18pt}.menuWrap .nikonValue{font-size:16pt;width:14mm}.menuWrap .nikonNums{font-size:10pt}.menuWrap .lensInfoBox{font-size:12pt;padding:2mm 8mm}.menuWrap .nikonBottom{display:none}.final{height:25.5mm;border:1px solid #2e7d32;border-radius:2mm;overflow:hidden;background:#f4fbf2}.final h3{margin:0;background:#2e7d32;color:white;padding:1.3mm 2.6mm;font-size:7.8pt;text-transform:uppercase}.finalBody{display:grid;grid-template-columns:13mm 1fr 41mm;gap:2.6mm;padding:2.1mm 2.5mm;font-size:6.6pt}.check{width:10.5mm;height:10.5mm;border-radius:50%;background:#2e7d32;color:white;font-size:16pt;font-weight:700;display:flex;align-items:center;justify-content:center}.finalVals{border:1px solid #95c788;border-radius:1.4mm;background:white;padding:1.5mm;font-size:6.35pt}.cert{height:24mm;margin-top:2.5mm;border:1px solid #0f4c81;border-radius:2mm;display:grid;grid-template-columns:22mm 1fr 52mm 50mm;gap:3.5mm;align-items:center;padding:2.2mm;font-size:6.8pt}.seal{width:14mm;height:14mm;border-radius:50%;background:#0f4c81;color:white;font-size:16pt;font-weight:700;display:flex;align-items:center;justify-content:center;margin:auto}.signature{font-family:"Brush Script MT","Segoe Script",cursive;font-size:12.5pt;border-bottom:1px solid #222}.disclaimer{position:absolute;left:8mm;right:8mm;bottom:8.4mm;color:#5f6b77;font-size:5.75pt;text-align:center}.footer{position:absolute;left:0;right:0;bottom:0;height:8mm;background:#0f4c81;color:white;display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;padding:0 8mm;font-size:7.2pt}.footer div:nth-child(2){text-align:center}.footer div:nth-child(3){text-align:right}
/* v10 PDF full-menu containment */
.nikonPdfMenuBox{
  width:100% !important;
  height:auto !important;
  aspect-ratio:1448 / 1086 !important;
  background:#000 !important;
  overflow:hidden !important;
}
.nikonPdfMenuBox img{
  width:100% !important;
  height:auto !important;
  aspect-ratio:1448 / 1086 !important;
  object-fit:contain !important;
  display:block !important;
}
.nikonPdfLensTextOnly{
  position:absolute !important;
  left:8.4% !important;
  right:27.0% !important;
  top:66.4% !important;
  height:10.2% !important;
  background:transparent !important;
  color:#fff !important;
  overflow:hidden !important;
  display:flex !important;
  flex-direction:column !important;
  justify-content:center !important;
}
.nikonPdfLensTextOnly div{font-size:7.2pt !important;line-height:1.18 !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important}
.nikonPdfLensTextOnly small{font-size:4.5pt !important;line-height:1.15 !important;color:#ddd !important;margin-top:.25mm !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important}


/* v12 PDF Nikon menu full-image fix */
.nikonPdfMenuImageWrap{position:relative;width:100%;aspect-ratio:1448/1086;background:#000;overflow:hidden}
.nikonPdfMenuImageWrap img{width:100%;height:100%;object-fit:contain;display:block;background:#000}
.nikonPdfLensTextOnly{position:absolute;left:5.6%;right:29.5%;top:65.7%;height:10.3%;color:#fff;background:transparent;overflow:hidden;display:flex;flex-direction:column;justify-content:center}
.nikonPdfLensTextOnly div{font-size:6.7pt;line-height:1.18;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nikonPdfLensTextOnly small{font-size:4.1pt;line-height:1.12;color:#ddd;margin-top:.2mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}


/* v13 PDF Nikon menu full clean image */
.nikonPdfMenuImageWrap{position:relative;width:100%;aspect-ratio:1448/1086;background:#000;overflow:hidden}
.nikonPdfMenuImageWrap img{width:100%;height:100%;object-fit:contain;display:block;background:#000}
.nikonPdfLensTextOnly{position:absolute;left:7.3%;right:32.5%;top:67.0%;height:8.7%;color:#fff;background:transparent;overflow:hidden;display:flex;flex-direction:column;justify-content:center}
.nikonPdfLensTextOnly div{font-size:6.2pt;line-height:1.16;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nikonPdfLensTextOnly small{font-size:3.9pt;line-height:1.1;color:#ddd;margin-top:.15mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}


/* v14 PDF fix */
.nikonPdfMenuImageWrap{position:relative;width:100%;aspect-ratio:1448/1086;background:#000;overflow:hidden}
.nikonPdfMenuImageWrap img{width:100%;height:100%;object-fit:contain;display:block}
.nikonPdfLensTextOnly{position:absolute;left:7.4%;right:34.0%;top:67.2%;height:8.2%;color:#fff;background:transparent;overflow:hidden;display:flex;flex-direction:column;justify-content:center}
.nikonPdfLensTextOnly div{font-size:5.8pt;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nikonPdfLensTextOnly small{font-size:3.6pt;line-height:1.05;margin-top:.1mm;color:#ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nikonPdfSingleBadge{display:none}
.nikonPdfMenuImageWrap.single-mode .nikonPdfSingleBadge{display:flex;position:absolute;left:7.0%;top:35.1%;width:9.5%;height:12.5%;background:#020202;color:#fff;font-size:8pt;align-items:center;justify-content:center}

</style></head><body><div class="sheet"><div class="header"><img class="logo" src="${esc(logo)}"><div class="title"><h1>Nikon AF Fine-Tune Calibration Report</h1><h2>Cameracal Services</h2></div></div><div class="info"><div><div class="infoRow"><b>Customer:</b><span>${esc(customer)}</span></div><div class="infoRow"><b>Date:</b><span>${esc(date)}</span></div><div class="infoRow"><b>Camera:</b><span>${esc(cameraDesc)}</span></div><div class="infoRow"><b>Lens:</b><span>${esc(lens)}</span></div><div class="infoRow"><b>Subject Distance:</b><span>${esc(distanceSummary(single))}</span></div><div class="infoRow"><b>Saved Lens No:</b><span>${esc(lensNo)}</span></div></div><div><div class="infoRow"><b>Reference:</b><span>${esc(ref)}</span></div><div class="infoRow"><b>Technician:</b><span>${esc(technician)}</span></div><div class="infoRow"><b>Mode:</b><span>${single?'Single':'Wide / Tele'}</span></div><div class="infoRow"><b>Standard:</b><span>Nikon AF Fine-Tune Procedure v1.0</span></div><div class="infoRow"><b>Report ID:</b><span>${esc(reportId)}</span></div></div></div><div class="content"><div><div class="block"><h3>Before / After AF Fine-Tune Values</h3><table><tr><th>Position</th><th>Before Fine-Tune</th><th>After Fine-Tune</th></tr><tr><td><b>${single?'Single':'Wide'} (${wf}mm)</b></td><td class="${cls(bw)}">${signed(bw)}<br><small>${focus(bw)}</small></td><td class="${cls(aw)}">${signed(aw)}<br><small>${focus(aw)}</small></td></tr>${calRows}</table></div><div class="block"><h3>Image Resolution Performance (LP/mm)</h3><table><tr><th>Position</th><th>Before calibration</th><th>After calibration</th></tr>${lpRows}</table></div><div class="block"><h3>Lens Optimisation Aperture (Recommended)</h3><table><tr><th>Position</th><th>Recommended aperture</th></tr><tr><td><b>${single?'Single':'Wide'} (${wf}mm)</b></td><td>${esc(wideOpt)}</td></tr>${optRows}</table></div><div class="twobox"><div class="textbox"><h3>Nikon Fine-Tune Note</h3><p>AF Fine-Tune values are saved against the selected Nikon lens memory number.</p></div><div class="textbox"><h3>Technician Notes</h3><p>${esc($('techNotes').value||'No additional notes entered.')}</p></div></div></div><div><div class="block menuBlock"><h3>Nikon AF Fine-Tune Settings</h3><div class="menuWrap">${menuHTML}</div></div><div class="final"><h3>Final Result</h3><div class="finalBody"><div class="check">✓</div><div><h4>Calibration Successful</h4><div>AF Fine-Tune values have been recorded for saved lens No. ${esc(lensNo)}.</div><b>The camera and lens combination is now operating within expected calibration tolerances.</b></div><div class="finalVals">${finalValues}</div></div></div></div></div><div class="cert"><div class="seal">✓</div><div><b>QUALITY CERTIFIED</b><br>This calibration has been performed and verified using Cameracal Services procedures.</div><div><b>Technician Signature:</b><br><div class="signature">${esc(technician)}</div>Date: ${esc(date)}</div><div><b>Reference:</b><br>${esc(ref)}<br><br><b>Report ID:</b><br>${esc(reportId)}</div></div><div class="disclaimer">Calibration results reflect the tested camera and lens combination under the conditions present at the time of service. Customers are advised to independently verify autofocus accuracy and overall image performance prior to any important event, travel, assignment or commercial work.</div><div class="footer"><div>© Cameracal Services 2026</div><div>www.cameracalservices.co.uk</div><div>Professional Calibration. Accurate Results.</div></div></div><script>setTimeout(()=>window.print(),350)</script></body></html>`;
  const win=window.open('', '_blank'); if(!win){alert('Please allow pop-ups to generate the PDF report.');return;} win.document.open(); win.document.write(report); win.document.close();
}
document.addEventListener('DOMContentLoaded',init);
