export function normalizeTxs(txs, wallet) {
  const flows = [];

  txs.forEach(tx => {
    try {
      if (!tx.status.confirmed) return;
      if (!tx.status.block_time) return;

      const tsRaw = Number(tx.status.block_time);
      if (!isFinite(tsRaw) || tsRaw <= 0) return;

      const ts = tsRaw < 1e12 ? tsRaw * 1000 : tsRaw;

      let received = 0;
      let sent = 0;

      tx.vout.forEach(o => {
        if (o.scriptpubkey_address === wallet) received += o.value || 0;
      });

      tx.vin.forEach(i => {
        if (i.prevout.scriptpubkey_address === wallet) sent += i.prevout.value || 0;
      });

      let net = (received - sent) / 1e8;
      if (!isFinite(net) || net === 0) return;

      net = Math.round(net * 1000) / 1000;
      if (Object.is(net, -0)) net = 0;

      flows.push([ts, net]);
    } catch {
      return;
    }
  });

  return flows;
}
