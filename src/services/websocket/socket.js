import { io } from "socket.io-client";

const socket = io("http://192.168.1.3:7000", {
  // const socket = io("http://localhost:7000", {

  transports: ["websocket", "polling"],
  reconnection: true,
});
console.log("SOCKET FILE LOADED");

export default socket;
