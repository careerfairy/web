export const WEBRTC_ERRORS = [
    {
        text: "A WebSocket connection could not be established to allow for low-latency streaming on CareerFairy. This is generally caused by restrictive firewall rules that block WebSocket connection. Use a less restrictive network or contact CareerFairy.",
        value: "WebSocketNotSupported"
    },{
        text: "Although you and your operating system both granted access to your webcam and microphone, some other error prevented your media devices from being used. Please check with your IT support or contact CareerFairy.",
        value: "AbortError"
    },{
        text: "You have denied access to your microphone and webcam to CareerFairy. Please modify your browser media device settings and reload this page.",
        value: "NotAllowedError"
    },{
        text: "Your webcam and/or microphone seem to be incompatible with CareerFairy's streaming requirements. Please try another device or contact CareerFairy for support.",
        value: "NotFoundError"
    },{
        text: "Your webcam and/or microphone seem to be incompatible with CareerFairy's streaming requirements. Please try another device or contact CareerFairy for support.",
        value: "OverconstrainedError"
    },{
        text: "This browser seems to have some troubles accessing your webcam and/or microphone. CareerFairy recommends the use of Chrome for an optimal streaming experience.",
        value: "SecurityError"
    },{
        text: "Please open CareerFairy streaming over HTTPS.",
        value: "TypeError"
    },{
        text: "Your microphone might be used by another application. Please close all apps that require your microphone and try again.",
        value: "AudioAlreadyActive"
    },{
        text: "Your webcam might be used by another application. Please close all apps that require your webcam and try again.",
        value: "VideoAlreadyActive"
    },{
        text: "No secure connection could be established with the server.",
        value: "NotSupportedError"
    },{
        text: "This connection was not authorized by the streaming server.",
        value: "unauthorized_access"
    },{
        text: "Screen sharing was not authorized by the streamer.",
        value: "screen_share_permission_denied"
    },{
        text: "Another application is probably currently using your webcam and/or microphone. Please close the corresponding application and try again. If this doesn't help, your operating system is probably blocking access to the webcam and/or microphone.",
        value: "NotReadableError"
    },{
        text: "Someone else is currently streaming with this streaming link. Please try again later.",
        value: "streamIdInUse"
    },{
        text: "Some unspecific error occured that we have little experience with. Please contact CareerFairy so we can resolve this together.",
        value: "GenericError"
    }
];