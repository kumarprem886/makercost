// MakerCost — app.js

// Theme
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('mc-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('mc-theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});

// Dropdowns auto-fill
document.getElementById('stateSelect').addEventListener('change', function () {
  if (this.value !== 'custom') document.getElementById('electricityRate').value = this.value;
});
document.getElementById('printerSelect').addEventListener('change', function () {
  if (this.value !== 'custom') document.getElementById('printerWattage').value = this.value;
});
document.getElementById('platformSelect').addEventListener('change', function () {
  document.getElementById('platformFee').value = this.value;
});

function fmt(val) { return '₹' + val.toFixed(2); }

// ─── CALCULATE ───────────────────────────────────────────────
document.getElementById('calculateBtn').addEventListener('click', calculate);

function calculate() {
  const filamentCostPerKg = parseFloat(document.getElementById('filamentCostPerKg').value) || 0;
  const filamentUsedG     = parseFloat(document.getElementById('filamentUsedG').value) || 0;
  const wastePercent      = parseFloat(document.getElementById('wastePercent').value) || 0;
  const electricityRate   = parseFloat(document.getElementById('electricityRate').value) || 0;
  const printerWattage    = parseFloat(document.getElementById('printerWattage').value) || 0;
  const printTimeHours    = parseFloat(document.getElementById('printTimeHours').value) || 0;
  const printerPrice      = parseFloat(document.getElementById('printerPrice').value) || 0;
  const printerLifespan   = parseFloat(document.getElementById('printerLifespan').value) || 5000;
  const failureRate       = parseFloat(document.getElementById('failureRate').value) || 0;
  const postProcessHours  = parseFloat(document.getElementById('postProcessHours').value) || 0;
  const hourlyRate        = parseFloat(document.getElementById('hourlyRate').value) || 0;
  const profitMargin      = parseFloat(document.getElementById('profitMargin').value) || 0;
  const platformFee       = parseFloat(document.getElementById('platformFee').value) || 0;
  const packagingCost     = parseFloat(document.getElementById('packagingCost').value) || 0;
  const shippingCost      = parseFloat(document.getElementById('shippingCost').value) || 0;
  const bulkQty           = parseInt(document.getElementById('bulkQty').value) || 1;

  const totalFilamentG    = filamentUsedG * (1 + wastePercent / 100);
  const filamentCost      = (filamentCostPerKg / 1000) * totalFilamentG;
  const kWh               = (printerWattage / 1000) * printTimeHours;
  const electricityCost   = kWh * electricityRate;
  const machineWear       = printerLifespan > 0 ? (printerPrice / printerLifespan) * printTimeHours : 0;
  const laborCost         = (printTimeHours + postProcessHours) * hourlyRate;
  const subTotal1         = filamentCost + electricityCost + machineWear + laborCost;
  const failureBuffer     = subTotal1 * (failureRate / 100);
  const logisticsCost     = packagingCost + shippingCost;
  const totalCost         = subTotal1 + failureBuffer + logisticsCost;
  const profitAmount      = totalCost * (profitMargin / 100);
  const priceBeforeFee    = totalCost + profitAmount;
  const platformFeeAmount = priceBeforeFee * (platformFee / 100);
  const minPrice          = totalCost + platformFeeAmount;
  const recPrice          = priceBeforeFee + platformFeeAmount;
  const totalHours        = printTimeHours + postProcessHours;
  const effectiveHourlyWage = totalHours > 0 ? profitAmount / totalHours : 0;
  const costPerGram       = filamentUsedG > 0 ? totalCost / filamentUsedG : 0;
  const bulkTotal         = recPrice * bulkQty;

  document.getElementById('r-filament').textContent    = fmt(filamentCost);
  document.getElementById('r-electricity').textContent = fmt(electricityCost);
  document.getElementById('r-machine').textContent     = fmt(machineWear);
  document.getElementById('r-labor').textContent       = fmt(laborCost);
  document.getElementById('r-failure').textContent     = fmt(failureBuffer);
  document.getElementById('r-logistics').textContent   = fmt(logisticsCost);
  document.getElementById('r-totalCost').textContent   = fmt(totalCost);
  document.getElementById('r-profit').textContent      = fmt(profitAmount);
  document.getElementById('r-platform').textContent    = fmt(platformFeeAmount);
  document.getElementById('r-minPrice').textContent    = fmt(minPrice);
  document.getElementById('r-recPrice').textContent    = fmt(recPrice);
  document.getElementById('r-hourlyWage').textContent  = fmt(effectiveHourlyWage) + '/hr';
  document.getElementById('r-perGram').textContent     = fmt(costPerGram) + '/g';
  document.getElementById('r-profitUnit').textContent  = fmt(profitAmount);

  // Bulk row
  if (bulkQty > 1) {
    document.getElementById('bulkRow').style.display = 'flex';
    document.getElementById('bulkQtyLabel').textContent = bulkQty;
    document.getElementById('r-bulkTotal').textContent = fmt(bulkTotal);
  } else {
    document.getElementById('bulkRow').style.display = 'none';
  }

  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

  window._lastResult = {
    filamentCost, electricityCost, machineWear, laborCost,
    failureBuffer, logisticsCost, totalCost, profitAmount,
    platformFeeAmount, minPrice, recPrice, effectiveHourlyWage,
    costPerGram, bulkQty, bulkTotal,
    printName: document.getElementById('printName').value || 'Custom Print',
    filamentType: document.getElementById('filamentType').value || 'Filament',
    printTimeHours
  };

  // Auto-save to history
  saveToHistory(window._lastResult);
  renderHistory();
}

// ─── RESET ───────────────────────────────────────────────────
document.getElementById('resetBtn').addEventListener('click', () => {
  document.querySelectorAll('input[type="number"]').forEach(i => {
    const defaults = { wastePercent:'10', failureRate:'5', printerLifespan:'5000',
      profitMargin:'30', postProcessHours:'0', hourlyRate:'0',
      packagingCost:'0', shippingCost:'0', platformFee:'0', bulkQty:'1' };
    i.value = defaults[i.id] !== undefined ? defaults[i.id] : '';
  });
  document.getElementById('printName').value = '';
  document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  document.getElementById('results').style.display = 'none';
});

// ─── PRESETS ─────────────────────────────────────────────────
function getPresets() { return JSON.parse(localStorage.getItem('mc-presets') || '[]'); }
function savePresets(p) { localStorage.setItem('mc-presets', JSON.stringify(p)); }

function getCurrentValues() {
  const fields = ['filamentType','filamentCostPerKg','filamentUsedG','wastePercent',
    'electricityRate','printerWattage','printTimeHours','printerPrice','printerLifespan',
    'failureRate','postProcessHours','hourlyRate','profitMargin','platformFee',
    'packagingCost','shippingCost','bulkQty','printName'];
  const data = {};
  fields.forEach(id => { const el = document.getElementById(id); data[id] = el ? el.value : ''; });
  return data;
}

function applyValues(data) {
  Object.keys(data).forEach(id => { const el = document.getElementById(id); if (el) el.value = data[id]; });
}

document.getElementById('savePresetBtn').addEventListener('click', () => {
  const name = prompt('Name this preset (e.g. "PLA small print"):');
  if (!name) return;
  const presets = getPresets();
  presets.push({ name, data: getCurrentValues(), date: new Date().toLocaleDateString() });
  savePresets(presets);
  alert('Preset saved!');
});

document.getElementById('loadPresetBtn').addEventListener('click', () => {
  const presets = getPresets();
  const list = document.getElementById('presetsList');
  list.innerHTML = '';
  if (presets.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);padding:12px 0;">No presets saved yet.</p>';
  } else {
    presets.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'preset-item';
      row.innerHTML = `<span>${p.name} <small style="color:var(--text-muted)">${p.date}</small></span>
        <div><button data-i="${i}" class="load-btn">Load</button><button data-i="${i}" class="del-btn">Delete</button></div>`;
      list.appendChild(row);
    });
    list.querySelectorAll('.load-btn').forEach(btn => btn.addEventListener('click', () => {
      applyValues(presets[btn.dataset.i].data);
      document.getElementById('presetsModal').style.display = 'none';
    }));
    list.querySelectorAll('.del-btn').forEach(btn => btn.addEventListener('click', () => {
      presets.splice(btn.dataset.i, 1);
      savePresets(presets);
      btn.closest('.preset-item').remove();
    }));
  }
  document.getElementById('presetsModal').style.display = 'flex';
});

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('presetsModal').style.display = 'none';
});

// ─── HISTORY ─────────────────────────────────────────────────
function getHistory() { return JSON.parse(localStorage.getItem('mc-history') || '[]'); }
function setHistory(h) { localStorage.setItem('mc-history', JSON.stringify(h)); }

function saveToHistory(r) {
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    printName: r.printName,
    filamentType: r.filamentType,
    totalCost: r.totalCost,
    recPrice: r.recPrice,
    bulkQty: r.bulkQty,
    bulkTotal: r.bulkTotal,
    date: new Date().toLocaleString()
  });
  if (history.length > 50) history.pop();
  setHistory(history);
}

function renderHistory() {
  const history = getHistory();
  const section = document.getElementById('historySection');
  const list = document.getElementById('historyList');
  if (history.length === 0) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  list.innerHTML = '';
  history.forEach((h, i) => {
    const row = document.createElement('div');
    row.className = 'history-item';
    row.innerHTML = `
      <div>
        <div><strong>${h.printName}</strong> <span style="color:var(--text-muted);font-size:0.8rem">${h.filamentType}</span></div>
        <div class="history-meta">${h.date}${h.bulkQty > 1 ? ` &bull; Qty: ${h.bulkQty}` : ''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="history-price">${fmt(h.recPrice)}</div>
        <div class="history-actions">
          <button data-i="${i}" class="hist-del">✕</button>
        </div>
      </div>`;
    list.appendChild(row);
  });
  list.querySelectorAll('.hist-del').forEach(btn => btn.addEventListener('click', () => {
    const h = getHistory();
    h.splice(btn.dataset.i, 1);
    setHistory(h);
    renderHistory();
  }));
}

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
  if (confirm('Clear all print history?')) {
    setHistory([]);
    renderHistory();
  }
});

// Load history on startup
renderHistory();

// ─── COPY ────────────────────────────────────────────────────
document.getElementById('copyBtn').addEventListener('click', () => {
  if (!window._lastResult) return;
  const r = window._lastResult;
  const text = buildTextSummary(r);
  navigator.clipboard.writeText(text).then(() => alert('Summary copied!'));
});

function buildTextSummary(r) {
  return `*MakerCost — ${r.printName}*
━━━━━━━━━━━━━━━━━━━━
Material:       ${r.filamentType}
Print time:     ${r.printTimeHours}h
━━━━━━━━━━━━━━━━━━━━
Filament:       ${fmt(r.filamentCost)}
Electricity:    ${fmt(r.electricityCost)}
Machine wear:   ${fmt(r.machineWear)}
Labor:          ${fmt(r.laborCost)}
Failure buffer: ${fmt(r.failureBuffer)}
Packaging+Ship: ${fmt(r.logisticsCost)}
━━━━━━━━━━━━━━━━━━━━
Total Cost:     ${fmt(r.totalCost)}
Profit:         ${fmt(r.profitAmount)}
Platform fee:   ${fmt(r.platformFeeAmount)}
━━━━━━━━━━━━━━━━━━━━
Min Price:      ${fmt(r.minPrice)}
✅ Rec. Price:  ${fmt(r.recPrice)}${r.bulkQty > 1 ? `\n📦 Bulk (${r.bulkQty} units): ${fmt(r.bulkTotal)}` : ''}

Calculated with MakerCost 🖨️`;
}

// ─── WHATSAPP ────────────────────────────────────────────────
document.getElementById('whatsappBtn').addEventListener('click', () => {
  if (!window._lastResult) { alert('Calculate first!'); return; }
  const text = buildTextSummary(window._lastResult);
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
});

// ─── PDF ─────────────────────────────────────────────────────
function pfmt(val) { return 'Rs. ' + val.toFixed(2); }

document.getElementById('pdfBtn').addEventListener('click', () => {
  if (!window._lastResult) { alert('Calculate first!'); return; }
  const r = window._lastResult;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const cfg = getSettings();

  const purple = [108, 99, 255];
  const dark   = [26, 26, 46];
  const muted  = [107, 114, 128];
  const green  = [16, 185, 129];

  // Header bar
  const bizName   = cfg.bizName   || 'MakerCost';
  const ownerName = cfg.ownerName || '';
  const city      = cfg.city      || '';
  const phone     = cfg.phone     || '';
  const email     = cfg.email     || '';
  const insta     = cfg.instagram ? `@${cfg.instagram.replace('@','')}` : '';
  const line2 = [ownerName, city].filter(Boolean).join('  |  ');
  const line3 = [phone, email, insta].filter(Boolean).join(' | ');

  doc.setFillColor(...purple);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(bizName, 14, 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  if (line2) doc.text(line2, 14, 21);
  if (line3) doc.text(line3.replace(/[^\x00-\x7F]/g, ''), 14, 28);
  doc.setTextColor(200, 200, 255);
  doc.text('3D Print Price Quote', 14, 35);
  doc.setTextColor(255, 255, 255);
  doc.text(new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }), 196, 35, { align: 'right' });

  const safeStr = s => (s || '').replace(/[^\x00-\x7F]/g, '');

  // Print name
  doc.setTextColor(...dark);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(safeStr(r.printName) || 'Custom Print', 14, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  doc.text(`${safeStr(r.filamentType) || 'Filament'} | ${r.printTimeHours}h print time`, 14, 50);

  // Breakdown table
  const rows = [
    ['Filament cost',        pfmt(r.filamentCost)],
    ['Electricity cost',     pfmt(r.electricityCost)],
    ['Machine wear',         pfmt(r.machineWear)],
    ['Labor cost',           pfmt(r.laborCost)],
    ['Failure buffer',       pfmt(r.failureBuffer)],
    ['Packaging + Shipping', pfmt(r.logisticsCost)],
  ];

  let y = 60;
  doc.setFontSize(9);
  rows.forEach(([label, val], i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 248, 252); doc.rect(14, y - 4, 182, 8, 'F'); }
    doc.setTextColor(...dark);
    doc.text(label, 16, y);
    doc.text(val, 194, y, { align: 'right' });
    y += 10;
  });

  // Totals
  doc.setDrawColor(...purple);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 8;

  const totals = [
    ['Total Cost',    pfmt(r.totalCost),         dark,  'bold'],
    ['Profit margin', pfmt(r.profitAmount),       muted, 'normal'],
    ['Platform fee',  pfmt(r.platformFeeAmount),  muted, 'normal'],
  ];
  totals.forEach(([label, val, color, weight]) => {
    doc.setTextColor(...color);
    doc.setFont('helvetica', weight);
    doc.text(label, 16, y);
    doc.text(val, 194, y, { align: 'right' });
    y += 9;
  });

  // Final price box
  y += 4;
  doc.setFillColor(...purple);
  doc.roundedRect(14, y, 182, 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Recommended Selling Price', 20, y + 9);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(pfmt(r.recPrice), 194, y + 14, { align: 'right' });

  if (r.bulkQty > 1) {
    y += 30;
    doc.setFillColor(...green);
    doc.roundedRect(14, y, 182, 16, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Bulk Total (${r.bulkQty} units)`, 20, y + 10);
    doc.text(pfmt(r.bulkTotal), 194, y + 10, { align: 'right' });
  }

  // Footer
  doc.setTextColor(...muted);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const footerParts = [bizName, city, phone, email].filter(Boolean);
  doc.text(safeStr(footerParts.join(' | ')), 105, 285, { align: 'center' });

  doc.save(`MakerCost_${r.printName.replace(/\s+/g, '_')}.pdf`);
});

// ─── INSTAGRAM CARD ──────────────────────────────────────────
document.getElementById('instaBtn').addEventListener('click', () => {
  if (!window._lastResult) { alert('Calculate first!'); return; }
  const r = window._lastResult;
  const s = getSettings();
  document.getElementById('ic-title').textContent    = r.printName;
  document.getElementById('ic-material').textContent = r.filamentType;
  document.getElementById('ic-time').textContent     = `${r.printTimeHours}h`;
  document.getElementById('ic-cost').textContent     = fmt(r.totalCost);
  document.getElementById('ic-price').textContent    = fmt(r.recPrice);
  const handle = s.instagram ? `@${s.instagram.replace('@','')}` : '@shroomlab_3d';
  const city   = s.city ? `${s.city} 🇮🇳` : 'Printed in India 🇮🇳';
  document.getElementById('ic-footer').textContent   = `${city} | ${handle}`;
  document.getElementById('instaModal').style.display = 'flex';
});

document.getElementById('closeInstaModal').addEventListener('click', () => {
  document.getElementById('instaModal').style.display = 'none';
});

document.getElementById('downloadInstaBtn').addEventListener('click', () => {
  const card = document.getElementById('instaCard');
  html2canvas(card, { scale: 3, backgroundColor: null }).then(canvas => {
    const link = document.createElement('a');
    link.download = `MakerCost_${(window._lastResult?.printName || 'print').replace(/\s+/g,'_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

// ─── SHARE ───────────────────────────────────────────────────
document.getElementById('shareBtn').addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({ title: 'MakerCost', text: 'Calculate the real cost of your 3D prints!', url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'));
  }
});

// ─── SETTINGS ────────────────────────────────────────────────
function getSettings() {
  return JSON.parse(localStorage.getItem('mc-settings') || '{}');
}
function saveSettings(s) {
  localStorage.setItem('mc-settings', JSON.stringify(s));
}

function applySettingsToUI() {
  const s = getSettings();
  if (s.bizName)    document.getElementById('s-bizName').value    = s.bizName;
  if (s.ownerName)  document.getElementById('s-ownerName').value  = s.ownerName;
  if (s.phone)      document.getElementById('s-phone').value      = s.phone;
  if (s.city)       document.getElementById('s-city').value       = s.city;
  if (s.email)      document.getElementById('s-email').value      = s.email;
  if (s.instagram)  document.getElementById('s-instagram').value  = s.instagram;
  if (s.logoDataUrl) {
    document.getElementById('s-logoImg').src = s.logoDataUrl;
    document.getElementById('s-logoPreview').style.display = 'block';
  }
  // Update Instagram card footer
  const handle = s.instagram ? `@${s.instagram.replace('@','')}` : '@shroomlab_3d';
  document.getElementById('ic-footer').textContent = `Printed in India 🇮🇳 | ${handle}`;
}

document.getElementById('settingsBtn').addEventListener('click', () => {
  applySettingsToUI();
  document.getElementById('settingsModal').style.display = 'flex';
});

document.getElementById('closeSettingsBtn').addEventListener('click', () => {
  document.getElementById('settingsModal').style.display = 'none';
});

// Logo file preview
document.getElementById('s-logo').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('s-logoImg').src = e.target.result;
    document.getElementById('s-logoPreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
});

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  const existing = getSettings();
  const logoFile = document.getElementById('s-logo').files[0];

  function persist(logoDataUrl) {
    const s = {
      bizName:    document.getElementById('s-bizName').value.trim(),
      ownerName:  document.getElementById('s-ownerName').value.trim(),
      phone:      document.getElementById('s-phone').value.trim(),
      city:       document.getElementById('s-city').value.trim(),
      email:      document.getElementById('s-email').value.trim(),
      instagram:  document.getElementById('s-instagram').value.trim(),
      logoDataUrl: logoDataUrl || existing.logoDataUrl || null
    };
    saveSettings(s);
    applySettingsToUI();
    document.getElementById('settingsModal').style.display = 'none';
    alert('Settings saved!');
  }

  if (logoFile) {
    const reader = new FileReader();
    reader.onload = e => persist(e.target.result);
    reader.readAsDataURL(logoFile);
  } else {
    persist(null);
  }
});

// Load settings on startup
applySettingsToUI();

// ─── PWA ─────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
