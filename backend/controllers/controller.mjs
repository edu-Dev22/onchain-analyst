import fs from "fs";
import wallets from "../models/walletModels.mjs";
import { fetchWalletTx } from "../services/mempoolService.mjs";
import { normalizeTxs } from "../models/flowModel.mjs";
import path from "path";
import { fileURLToPath } from "url";
const dirname = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(dirname, "../data/flow.json");

let cache = null;

// ==============================
// REBUILD (SECUENCIAL, SEGURO)
// ==============================
export async function rebuildFlow(req, res) {
  try {
    let all = [];

    for (const wallet of wallets) {
      
      console.log("Descargando:", wallet);

      const txs = await fetchWalletTx(wallet, 10000);

      const norm = normalizeTxs(txs, wallet);


      all.push(...norm);
    }

    all.sort((a, b) => a[0] - b[0]);

    fs.writeFileSync(output, JSON.stringify(all, null, 2));
    cache = all;

    res.json({ ok: true, wallets: wallets.length, flows: all.length });

  } catch (e) {
    console.error("REBUILD ERROR:", e);
    res.status(500).json({ error: e.message });
  }
}

// ==============================
// GET SOLO RANGO
// ==============================
export function getFlow(req, res) {
  try {
    if (!fs.existsSync(output)) fs.writeFileSync(output, "[]");

    if (!cache) {
      cache = JSON.parse(fs.readFileSync(output, "utf-8") || "[]");
    }

    const start = Number(req.query.start);
    const end = Number(req.query.end);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return res.json([]);
    }

    const out = cache.filter(([ts]) => ts >= start && ts <= end);
    res.json(out);

  } catch (e) {
    console.error("GET FLOW ERROR:", e);
    res.status(500).json({ error: e.message });
  }
}
