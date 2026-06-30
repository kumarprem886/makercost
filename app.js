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

// State dropdowns auto-fill electricity rate
document.getElementById('stateSelect').addEventListener('change', function () {
  if (this.value !== 'custom') {
    document.getElementById('electricityRate').value = this.value;
  }
});

// Printer dropdown auto-fill wattage
document.getElementById('printerSelect').addEventListener('change', function () {
  if (this.value !== 'custom') {
    document.getElementById('printerWattage').value = this.value;
  }
});

// Platform dropdown auto-fill fee
document.getElementById('platformSelect').addEventListener('change', function () {
  document.getElementById('platformFee').value = this.value;
});

// Format currency
function fmt(val) {
  return '₹' + val.toFixed(2);
}

// CALCULATE
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

  // Filament cost including waste
  const totalFilamentG    = filamentUsedG * (1 + wastePercent / 100);
  const filamentCost      = (filamentCostPerKg / 1000) * totalFilamentG;

  // Electricity cost
  const kWh               = (printerWattage / 1000) * printTimeHours;
  const electricityCost   = kWh * electricityRate;

  // Machine depreciation
  const machineWear       = printerLifespan > 0 ? (printerPrice / printerLifespan) * printTimeHours : 0;

  // Labor
  const laborCost         = (printTimeHours + postProcessHours) * hourlyRate;

  // Failure buffer
  const subTotal1         = filamentCost + electricityCost + machineWear + laborCost;
  const failureBuffer     = subTotal1 * (failureRate / 100);

  // Logistics
  const logisticsCost     = packagingCost + shippingCost;

  // Total cost
  const totalCost         = subTotal1 + failureBuffer + logisticsCost;

  // Profit
  const profitAmount      = totalCost * (profitMargin / 100);

  // Price before platform fee
  const priceBeforeFee    = totalCost + profitAmount;

  // Platform fee applied on selling price
  const platformFeeAmount = priceBeforeFee * (platformFee / 100);

  // Final selling price
  const minPrice          = totalCost + platformFeeAmount;
  const recPrice          = priceBeforeFee + platformFeeAmount;

  // Insights
  const totalHours        = printTimeHours + postProcessHours;
  const effectiveHourlyWage = totalHours > 0 ? profitAmount / totalHours : 0;
  const costPerGram       = filamentUsedG > 0 ? totalCost / filamentUsedG : 0;
  const profitPerUnit     = profitAmount;

  // Display
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
  document.getElementById('r-profitUnit').textContent  = fmt(profitPerUnit);

  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Store last result for sharing
  window._lastResult = {
    filamentCost, electricityCost, machineWear, laborCost,
    failureBuffer, logisticsCost, totalCost, profitAmount,
    platformFeeAmount, minPrice, recPrice,
    effectiveHourlyWage, costPerGram, profitPerUnit
  };
}

// RESET
document.getElementById('resetBtn').addEventListener('click', () => {
  document.querySelectorAll('input').forEach(i => {
    if (!['wastePercent','failureRate','printerLifespan','profitMargin','postProcessHours','hourlyRate','packagingCost','shippingCost'].includes(i.id)) {
      i.value = '';
    }
  });
  document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  document.getElementById('wastePercent').value   = 10;
  document.getElementById('failureRate').value    = 5;
  document.getElementById('printerLifespan').value = 5000;
  document.getElementById('profitMargin').value   = 30;
  document.getElementById('postProcessHours').value = 0;
  document.getElementById('hourlyRate').value     = 0;
  document.getElementById('packagingCost').value  = 0;
  document.getElementById('shippingCost').value   = 0;
  document.getElementById('platformFee').value    = 0;
  document.getElementById('results').style.display = 'none';
});

// PRESETS
function getPresets() {
  return JSON.parse(localStorage.getItem('mc-presets') || '[]');
}
function savePresets(presets) {
  localStorage.setItem('mc-presets', JSON.stringify(presets));
}

function getCurrentValues() {
  const fields = ['filamentType','filamentCostPerKg','filamentUsedG','wastePercent',
    'electricityRate','printerWattage','printTimeHours','printerPrice','printerLifespan',
    'failureRate','postProcessHours','hourlyRate','profitMargin','platformFee',
    'packagingCost','shippingCost'];
  const data = {};
  fields.forEach(id => {
    const el = document.getElementById(id);
    data[id] = el ? el.value : '';
  });
  return data;
}

function applyValues(data) {
  Object.keys(data).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = data[id];
  });
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
      row.innerHTML = `
        <span>${p.name} <small style="color:var(--text-muted)">${p.date}</small></span>
        <div>
          <button data-i="${i}" class="load-btn">Load</button>
          <button data-i="${i}" class="del-btn">Delete</button>
        </div>`;
      list.appendChild(row);
    });
    list.querySelectorAll('.load-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyValues(presets[btn.dataset.i].data);
        document.getElementById('presetsModal').style.display = 'none';
      });
    });
    list.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        presets.splice(btn.dataset.i, 1);
        savePresets(presets);
        btn.closest('.preset-item').remove();
      });
    });
  }
  document.getElementById('presetsModal').style.display = 'flex';
});

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('presetsModal').style.display = 'none';
});

// COPY SUMMARY
document.getElementById('copyBtn').addEventListener('click', () => {
  if (!window._lastResult) return;
  const r = window._lastResult;
  const text = `MakerCost — Price Summary
-------------------------
Filament:       ${fmt(r.filamentCost)}
Electricity:    ${fmt(r.electricityCost)}
Machine wear:   ${fmt(r.machineWear)}
Labor:          ${fmt(r.laborCost)}
Failure buffer: ${fmt(r.failureBuffer)}
Packaging+Ship: ${fmt(r.logisticsCost)}
Total Cost:     ${fmt(r.totalCost)}
Profit:         ${fmt(r.profitAmount)}
Platform fee:   ${fmt(r.platformFeeAmount)}
-------------------------
Min Price:      ${fmt(r.minPrice)}
Rec. Price:     ${fmt(r.recPrice)}
Profit/unit:    ${fmt(r.profitPerUnit)}
`;
  navigator.clipboard.writeText(text).then(() => alert('Summary copied to clipboard!'));
});

// SHARE
document.getElementById('shareBtn').addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: 'MakerCost — 3D Print Price Calculator',
      text: 'Calculate the real cost of your 3D prints!',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'));
  }
});

// PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
