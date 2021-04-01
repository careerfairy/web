import {useEffect, useState} from "react";
import {getBaseUrl} from "../helperFunctions/HelperFunctions";
import {useFirestore} from "react-redux-firebase";

const useStreamToken = (streamId = "") => {
    const firestore = useFirestore()
    const [streamToken, setStreamToken] = useState("");
    const [mainStreamerLink, setMainStreamerLink] = useState("");
    const [joiningStreamerLink, setJoiningStreamerLink] = useState("");

    useEffect(() => {
        if (streamId) {
            (async function getToken() {
                const tokenDoc = await firestore.get({
                    collection: "livestreams",
                    doc: streamId,
                    subcollections: [{
                        collection: "tokens",
                        doc: "secureToken",
                    }]
                })
                if (tokenDoc.exists) {
                    const secureToken = tokenDoc.data().value
                    setStreamToken(secureToken);
                    const baseUrl = getBaseUrl()
                    setMainStreamerLink(`${baseUrl}/streaming/${streamId}/main-streamer?token=${secureToken}`)
                    setJoiningStreamerLink(`${baseUrl}/streaming/${streamId}/joining-streamer?token=${secureToken}`)
                }
            })()
        }

    }, [streamId])

    return {streamToken, mainStreamerLink, joiningStreamerLink}
}

export default useStreamToken