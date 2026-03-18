const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function fetchWalletTx(address, max = 10000) {
  let all = [];
  let lastTxid = null;

  while (true) {
    const url = lastTxid
      ? `https://mempool.emzy.de/api/address/${address}/txs/chain/${lastTxid}`
      : `https://mempool.emzy.de/api/address/${address}/txs`;

    const res = await fetch(url);

    if (!res.ok) {
      console.log("Rate limit, esperando...");
      await sleep(3000);   // ⏸️ 3 segundos
      continue;
    }

    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    all.push(...batch);
    lastTxid = batch[batch.length - 1].txid;

    if (all.length >= max) break;
    await sleep(350); // ⏸️ pequeño delay entre páginas
  }

  return all;
}
