/** public/js/utils.js  —  ES module of shared helpers */

/* -------------------- datetime helpers -------------------- */

/** Pad number with leading zeroes (2 digits) */
export const pad2 = n => String(n).padStart(2, '0');

/** Format a Date as "YYYY-MM-DDTHH:MM" for <input type="datetime-local"> */
export function fmtLocalDatetime(d, withSeconds = false) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1); // JS months are 0-11
  const day = pad2(d.getDate());
  const h = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  const base = `${y}-${m}-${day}T${h}:${min}`;
  return withSeconds ? `${base}:${pad2(d.getSeconds())}` : base;
}

/** Build a UTC interval "from/to" from two local datetime-local strings */
export function buildUtcRange(startLocal, endLocal) {
  const trimIso = d => d.toISOString().slice(0, 19) + 'Z'; // drop ms
  const from = new Date(startLocal); // treated as local
  const to   = new Date(endLocal);
  return `${trimIso(from)}/${trimIso(to)}`;
}

/** Clamp two <input type="datetime-local"> to min/max and ensure start <= end */
export function clampDatetimeInputRange(startEl, endEl, { min, max }) {
  if (min) { startEl.min = min; endEl.min = min; }
  if (max) { startEl.max = max; endEl.max = max; }
  if (startEl.value && min && startEl.value < min) startEl.value = min;
  if (endEl.value   && min && endEl.value   < min) endEl.value   = min;
  if (startEl.value && max && startEl.value > max) startEl.value = max;
  if (endEl.value   && max && endEl.value   > max) endEl.value   = max;
  if (startEl.value && endEl.value && startEl.value > endEl.value) {
    endEl.value = startEl.value;
  }
}

/* -------------------- data mappers -------------------- */

/**
 * GeoMet Hydrometric (hydrometric-realtime GeoJSON)
 * → [{ x: Date, y: Number }]
 * valueField: 'LEVEL' (m) or 'DISCHARGE' (m³/s)
 */
export function toPointsHydrometric(geo, valueField = 'LEVEL') {
  if (!geo || !Array.isArray(geo.features)) return [];
  return geo.features
    .map(f => ({
      x: new Date(f.properties?.DATETIME),      // UTC instant
      y: Number(f.properties?.[valueField])     // number
    }))
    .filter(p => p.x instanceof Date && !isNaN(p.x) && Number.isFinite(p.y))
    .sort((a, b) => a.x - b.x);
}

/**
 * IWLS (DFO tides) common shapes → [{ x: Date, y: Number }]
 * Supports:
 *  - [{ eventDate, value, ... }]
 *  - [[eventDate, ..., value, ...]]  (adjust indices if needed)
 */
export function toPointsIwls(json, dateIdx = 0, valueIdx = 2) {
  if (!Array.isArray(json) || !json.length) return [];

  // Case A: array of objects
  if (!Array.isArray(json[0]) && 'eventDate' in json[0] && 'value' in json[0]) {
    return json
      .map(r => ({ x: new Date(r.eventDate), y: Number(r.value) }))
      .filter(p => p.x instanceof Date && !isNaN(p.x) && Number.isFinite(p.y))
      .sort((a, b) => a.x - b.x);
  }

  // Case B: array of arrays
  if (Array.isArray(json[0])) {
    return json
      .map(row => ({ x: new Date(row[dateIdx]), y: Number(row[valueIdx]) }))
      .filter(p => p.x instanceof Date && !isNaN(p.x) && Number.isFinite(p.y))
      .sort((a, b) => a.x - b.x);
  }

  return [];
}

/* -------------------- rendering -------------------- */

/** Render [{x:Date,y:Number}] into a simple table body */
export function renderTableFromPoints(points, {
  zone = 'America/Vancouver',
  decimals = 2,
  target = '#levels tbody',
} = {}) {
  const tbody = document.querySelector(target);
  if (!tbody) return;

  const rows = points.map(p => {
    const d = p.x instanceof Date ? p.x : new Date(p.x);
    const timeStr = d.toLocaleString('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: zone
    });
    const val = Number(p.y);
    return `<tr>
      <td style="padding:6px; border-bottom:1px solid #f0f0f0;">${timeStr}</td>
      <td style="padding:6px; text-align:right; border-bottom:1px solid #f0f0f0;">
        ${Number.isFinite(val) ? val.toFixed(decimals) : ''}
      </td>
    </tr>`;
  }).join('');

  tbody.innerHTML = rows || `<tr><td colspan="2" style="opacity:.7;">No data</td></tr>`;
}

/**
 * Draw a Chart.js line from points.
 * NOTE: expects Chart.js + date adapter already loaded on the page.
 */
export function drawLineChart(canvasEl, points, title = 'Series') {
  if (!canvasEl) return;
  const el = typeof canvasEl === 'string' ? document.getElementById(canvasEl) : canvasEl;
  if (!el) return;

  // ensure clean, sorted, finite
  const data = points
    .filter(p => p && p.x != null && p.y != null)
    .map(p => ({ x: (p.x instanceof Date ? p.x : new Date(p.x)), y: Number(p.y) }))
    .filter(p => Number.isFinite(p.y))
    .sort((a, b) => a.x - b.x);

  if (drawLineChart._chart) drawLineChart._chart.destroy();

  const minX = data.length ? data[0].x.getTime() : undefined;
  const maxX = data.length ? data[data.length - 1].x.getTime() : undefined;

  drawLineChart._chart = new Chart(el, {
    type: 'line',
    data: {
      datasets: [{
        label: title,
        data,
        parsing: false,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      normalized: true,
      scales: {
        x: {
          type: 'time',
          bounds: 'data',       // <-- key: fit to data range
          min: minX,            // <-- also pin the exact min/max
          max: maxX,
          // optional helpers:
          // distribution: 'linear',
          // time: { unit: 'hour' } // or 'minute' if you prefer
        },
        y: { beginAtZero: false }
      },
      plugins: {
        decimation: { enabled: false }, // keep off while debugging
        tooltip: { mode: 'index', intersect: false }
      },
      animation: false
    }
  });
}



/* -------------------- fetch & utils -------------------- */

/** Simple JSON fetch with error bubbling (useful for your proxy calls) */
export async function fetchJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? (() => { try { return JSON.parse(text); } catch { return text; } })() : text;
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }
  try { return JSON.parse(text); } catch { return text; }
}

/** Read JSON embedded in a <script type="application/json" id="..."> safely */
export function readEmbeddedJson(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  try { return JSON.parse(el.textContent); } catch { return null; }
}

/** Build a query string from an object (skips null/undefined) */
export function qs(params = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    search.append(k, String(v));
  }
  return search.toString();
}
