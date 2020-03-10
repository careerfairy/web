export const WEBRTC_ERRORS = [
    {
        text: "A WebSocket connection could not be established to allow for low-latency streaming on CareerFairy. This is generally caused by restrictive firewall rules that block WebSocket connection. Ask your network administrator for support or switch to a less restrictive network.",
        value: "WebSocketNotSupported"
    },{
        text: "Although you and your operating system both granted access to your webcam and microphone, some other error prevented your media devices from being used. Please check with your IT support or contact CareerFairy.",
        value: "AbortError"
    },{
        text: "Oh no! You have denied access to your microphone and webcam to CareerFairy. Please modify your browser media device settings and reload this page.",
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
        text: "While you granted CareerFairy permission to use your webcam and microphone, either the operating system or the browser did not allow this usage. Please check if your browser is allowed to use your webcam and microphone and whether any other application is using them.",
        value: "NotReadableError"
    },{
        text: "Some unspecific error occured that we have little experience with. Please contact CareerFairy so we can resolve this together.",
        value: "GenericError"
    }
];