import WsInstance from "../app/Services/Ws"
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from "ws";
WsInstance.boot()

interface CustomWebsocket extends WebSocket {
    id: string
}

const rooms = {};

function getOtherPeer(challengeId: string, socket: CustomWebsocket) {
    return rooms[challengeId].find((s: CustomWebsocket) => s.id !== socket.id);
}

WsInstance.ws.on('connection', (socket: CustomWebsocket) => {

    socket.id = uuidv4()

    socket.on('close', () => {
        Object.keys(rooms).forEach((key) => {
            rooms[key] = rooms[key].filter((s: CustomWebsocket) => s.id !== socket.id);
            if (rooms[key].length === 0) {
                delete rooms[key];
            }
        });
    })

    socket.on('message', (data) => {
        try {
            const message: { action: string, challengeId: string, icecandidate: string, offer: string, answer: string } = JSON.parse(data.toString())
            if (message.action === 'join') {
                if (rooms[message.challengeId]?.length === 2) return;

                if (rooms[message.challengeId]) {
                    rooms[message.challengeId].push(socket)
                }
                else {
                    rooms[message.challengeId] = [socket];
                }

                // Other peer in join is always the Service Provider (Zerologin)
                const otherPeer = getOtherPeer(message.challengeId, socket);
                if (otherPeer) {
                    // socket.send("remote-peer:" + otherPeer.id);
                    otherPeer.send("remote-peer:" + socket.id);
                }
            }
            else if (message.action === 'offer') {
                const otherPeer = getOtherPeer(message.challengeId, socket);
                if (otherPeer) {
                    otherPeer.send("offer:" + message.offer);
                }
            }
            else if (message.action === 'answer') {
                const otherPeer = getOtherPeer(message.challengeId, socket);
                if (otherPeer) {
                    otherPeer.send("answer:" + message.answer);
                }
            }
            else if (message.action === 'icecandidate') {
                const otherPeer = getOtherPeer(message.challengeId, socket);
                if (otherPeer) {
                    otherPeer.send("icecandidate:" + message.icecandidate);
                }
            }
        } catch (error) {
            console.log("Websocket error", error)
            console.log("Websocket error", data.toString())
        }
    })
})