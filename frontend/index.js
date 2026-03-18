"use strict";

let chart;
let candles = [];
let allWalletMoves = []; // guarda todos los movimientos cargados
let walletMoves = []; // movimientos que se dibujan
let flowTimer = null;

// ==============================
// CARGAR FLOWS (SOLO RANGO VISIBLE)
// ==============================

const loadWalletMoves = async (start, end) => {

  const res = await fetch(`/api/flow?start=${start}&end=${end}`);
  const json = await res.json();

  allWalletMoves = json.map(m => {

    const ts = Number(m[0]);
    const amount = Number(m[1]);

    let best = null;
    let min = Infinity;

    for (const c of candles) {

      if (c.x < start || c.x > end) continue;

      const d = Math.abs(c.x - ts);

      if (d < min) {
        min = d;
        best = c;
      }

    }

    if (!best) return null;

    const base = best.c;
    const offset = amount > 0 ? 1.002 : 0.998;

    const d = new Date(ts);

    return {
      x: best.x,
      y: base * offset,
      amount,
      fecha: d.toISOString().slice(0, 10),
      hora: d.toTimeString().slice(0, 8)
    };

  }).filter(p => p !== null);

  walletMoves = [...allWalletMoves];

};

// ==============================
// FILTRO POR DOBLE SLIDER
// ==============================

function applyVolumeFilter(min, max) {

  walletMoves = allWalletMoves.filter(p => {

    const amount = Math.abs(p.amount);

    return amount >= min && amount <= max;

  });

  chart.data.datasets[1].data = walletMoves;

  chart.update("none");

}

// ==============================
// BINANCE
// ==============================

const prizeBtcUsdt = async (symbol, interval, startTime, endTime) => {

  const res = await axios.get("https://api.binance.com/api/v3/klines", {
    params: { symbol, interval, startTime, endTime, limit: 1000 }
  });

  return res.data;

};

console.log(prizeBtcUsdt("BTCUSDT", "1h", Date.now() - 1000 * 60 * 60, Date.now()));



const buildCandles = data => data.map(c => ({

  x: Number(c[0]),
  o: Number(c[1]),
  h: Number(c[2]),
  l: Number(c[3]),
  c: Number(c[4])

}));

// ==============================
// CHART
// ==============================

const initChart = () => {

  chart = new Chart(document.getElementById("myChart"), {

    data: {

      datasets: [

        {
          label: "BTCUSDT",
          type: "candlestick",
          data: []
        },

        {
          type: "scatter",
          label: "Wallet Flow",
          data: [],
          pointRadius: 7,
          pointBackgroundColor: ctx => {

            if (!ctx.raw) return "#999";

            return ctx.raw.amount > 0 ? "#00ff6a" : "#ff0033";

          }
        }

      ]
    },

    options: {
      parsing: false,
      scales: {
        x: { type: "time" },
        y: { position: "left" },
      },
       plugins: {
        tooltip: {
          mode: "nearest",
          intersect: false,
          callbacks: {
            label: ctx => {
              if (ctx.dataset.type === "scatter") {
                const r = ctx.raw;
                return `Wallet: (${r.fecha}, ${r.hora}, ${r.amount} BTC)`;
              }
              if (ctx.dataset.type === "candlestick") {
                const c = ctx.raw;
                return `O:${c.o} H:${c.h} L:${c.l} C:${c.c}`;
              }
            }
          }
        },
        zoom: {

          pan: {
            enabled: true,
            mode: "xy"
          },

          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: "xy",
            onZoomComplete: ({ chart }) => reloadVisibleFlow(chart)
          }

        }
      }
    }

  });


};

// ==============================
// CARGAR VELAS
// ==============================

const loadCandlesRange = async (start, end) => {

  const symbol = "BTCUSDT";
  const interval = "1h";

  const block = 3600000 * 999;

  while (start < end) {

    const next = Math.min(start + block, end);

    const data = await prizeBtcUsdt(symbol, interval, start, next);

    if (!data.length) break;

    buildCandles(data).forEach(c => {

      candles.push(c);

      chart.data.datasets[0].data.push(c);

    });

    start = next;

  }

};


// ==============================
// DOBLE SLIDER
// ==============================

const minSlider = document.querySelector(".min-val");
const maxSlider = document.querySelector(".max-val");

function updateVolumeRange() {

  const min = Number(minSlider.value);
  const max = Number(maxSlider.value);

  applyVolumeFilter(min, max);

}

minSlider.addEventListener("input", updateVolumeRange);

maxSlider.addEventListener("input", updateVolumeRange);



// ==============================
// RECARGAR SOLO LO VISIBLE
// ==============================

async function reloadVisibleFlow(chart) {

  clearTimeout(flowTimer);

  flowTimer = setTimeout(async () => {

    const scale = chart.scales.x;

    if (!scale) return;

    const start = Math.floor(scale.min);
    const end = Math.ceil(scale.max);

    chart.data.datasets[1].data = [];

    await loadWalletMoves(start, end);

    const min = Number(minSlider.value);
    const max = Number(maxSlider.value);

    applyVolumeFilter(min, max);

  }, 150);

}


// ==============================
// INIT
// ==============================

const load = async () => {

  initChart();

  const end = Date.now();
  const start = end - 1000 * 60 * 60 * 24 * 365 * 2;

  candles = [];

  chart.data.datasets[0].data = [];

  await loadCandlesRange(start, end);

  await reloadVisibleFlow(chart);

};

load(); 

//Mejorar lo que haya que mejorar para que el programa tarde demasiado en repsonder, por ejemplo, añadiendo paginacion, webworkers o algo asi.

// Modificar el programa para que en vez de almacenar la infroamcin en json se almacene en DB.



//Video sobre integrales. el traductor de ingenieria min. 33:58