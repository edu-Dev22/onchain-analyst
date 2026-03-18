// This is the main structure for the project, it is a simple app that shows the flow of BTC in and out of a list of wallets, it is divided into two parts, the frontend and the backend, the frontend is a simple chart that shows the flow of BTC in and out of the wallets, the backend is a simple express server that serves the frontend and provides an API to get the flow data, the flow data is stored in a JSON file that is updated every time the rebuild API is called, the rebuild API fetches the transactions of the wallets from the binance API klines, normalizes them and saves them in the JSON file, the getFlow API simply returns the JSON file.


// onchain/
// │
// ├── frontend/
// │   │
// │   └── index.mjs
// │       ├── nearestCandle()        -> busca la vela más cercana
// │       ├── loadWalletMoves()      -> fetch /api/flow
// │       ├── prizeBtcUsdt()         -> llama a Binance
// │       ├── buildCandles()         -> normaliza velas
// │       ├── initChart()            -> crea chart.js
// │       ├── loadCandlesRange()     -> descarga histórico
// │       └── load()                 -> init general
// │
// └── backend/
//     │
//     ├── app.mjs
//     │   ├── express()
//     │   ├── app.use("/api", walletsRoutes)
//     │   └── serve ../frontend como estático
//     │
//     ├── routes/
//     │   └── walletsRoutes.mjs
//     │       ├── GET  /api/flow     -> controller.getFlow
//     │       └── POST /api/rebuild  -> controller.rebuildFlow
//     │
//     ├── controllers/
//     │   └── controller.mjs
//     │       ├── rebuildFlow()
//     │       │   ├── lee wallets
//     │       │   ├── llama mempoolService
//     │       │   ├── normaliza con flowModel
//     │       │   └── guarda data/flow.json
//     │       │
//     │       └── getFlow()
//     │           └── devuelve data/flow.json
//     │
//     ├── services/
//     │   └── mempoolService.mjs
//     │       └── fetchWalletTx()
//     │           └── API mempool.emzy.de
//     │
//     ├── models/
//     │   ├── walletModels.mjs
//     │   │   └── lista de wallets BTC
//     │   │
//     │   └── flowModel.mjs
//     │       └── normalizeTxs()
//     │           ├── filtra txs confirmadas
//     │           ├── detecta entradas/salidas
//     │           └── devuelve [timestamp, net]
//     │
//     └── data/
//         └── flow.json
//             └── [[timestamp, net], ...]
