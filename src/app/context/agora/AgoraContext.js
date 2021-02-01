// WebSocket.js

import React, { createContext } from 'react'
import { useDispatch } from 'react-redux';

const WebSocketContext = createContext(null)

export { WebSocketContext }

export default ({ children }) => {
    // let socket;
    // let ws;

    let AgoraRTC

    const dispatch = useDispatch();

    // const sendMessage = (roomId, message) => {
    //     const payload = {
    //         roomId: roomId,
    //         data: message
    //     }
    //     socket.emit("event://send-message", JSON.stringify(payload));
    //     dispatch(updateChatLog(payload));
    // }

    // if (!socket) {
    //     socket = io.connect(WS_BASE)
    //
    //     socket.on("event://get-message", (msg) => {
    //         const payload = JSON.parse(msg);
    //         dispatch(updateChatLog(payload));
    //     })
    //
    //     ws = {
    //         socket: socket,
    //         sendMessage
    //     }
    // }


     AgoraRTC = require('agora-rtc-sdk');
    let rtcClient = AgoraRTC.createClient({
        mode: "live",
        codec: "vp8",
    });
    rtcClient.init("53675bc6d3884026a72ecb1de3d19eb1");


    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )
}