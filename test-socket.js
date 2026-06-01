const io = require("socket.io-client");
const socket = io("http://192.168.1.13:7000", { transports: ["websocket"] });

socket.on("connect", () => {
    console.log("Connected");
    socket.emit("get-dashboard-data", { symbol: "BTCUSDT" });
    socket.emit("request-market-coins", { symbol: "BTCUSDT" });
    socket.emit("binance-sentiment", { symbol: "BTCUSDT" }); // if needed
});

socket.on("market-sentiment-data", (data) => {
    console.log("market-sentiment-data received! Keys:", Object.keys(data));
});

socket.on("binance-sentiment", (data) => {
    console.log("binance-sentiment received! Keys:", Object.keys(data));
});

socket.on("dashboard-data-response", (data) => {
    console.log("dashboard-data-response received! Keys:", Object.keys(data));
});

setTimeout(() => {
    console.log("Timeout reached, exiting.");
    process.exit(0);
}, 3000);
