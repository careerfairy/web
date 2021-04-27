import {useEffect, useState} from "react";
import {getBaseUrl} from "../helperFunctions/HelperFunctions";
import {useFirestore} from "react-redux-firebase";
import {useRouter} from "next/router";

const useStreamToken = () => {
    const {query: {livestreamId, breakoutRoomId}} = useRouter()
    const firestore = useFirestore()
    const [streamToken, setStreamToken] = useState("");
    const [mainStreamerLink, setMainStreamerLink] = useState("");
    const [joiningStreamerLink, setJoiningStreamerLink] = useState("");
    const [viewerLink, setViewerLink] = useState("");

    useEffect(() => {
        if (livestreamId) {
            (async function getToken() {
                const tokenDoc = await firestore.get({
                    collection: "livestreams",
                    doc: livestreamId,
                    subcollections: [{
                        collection: "tokens",
                        doc: "secureToken",
                    }]
                })
                const secureToken = tokenDoc.data?.()?.value || ""
                const tokenPath = secureToken ? `?token=${secureToken}` : ""
                setStreamToken(secureToken);
                const baseUrl = getBaseUrl()
                let breakoutRoomPath = breakoutRoomId ? `breakout-room/${breakoutRoomId}/` : ``
                setMainStreamerLink(`${baseUrl}/streaming/${livestreamId}/${breakoutRoomPath}main-streamer${tokenPath}`)
                setJoiningStreamerLink(`${baseUrl}/streaming/${livestreamId}/${breakoutRoomPath}joining-streamer${tokenPath}`)
                setViewerLink(`${baseUrl}/streaming/${livestreamId}/${breakoutRoomPath}viewer`)
            })()
        }

    }, [livestreamId, breakoutRoomId])

    return {streamToken, mainStreamerLink, joiningStreamerLink, viewerLink}
}

export default useStreamToken