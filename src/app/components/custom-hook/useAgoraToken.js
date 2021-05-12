import {useEffect, useState} from "react";
import * as actions from "../../store/actions"
import {useDispatch} from "react-redux";
import {useFirebase} from "../../context/firebase";
import {GENERAL_ERROR} from "../util/constants";
import {useRouter} from "next/router";


/**
 * @param {string} roomId
 * @param {string} uid
 * @param {boolean} isStreamer
 * @param {string|string[]} securityToken
 * @param {boolean} isScreenShareToken
 * @param {string} streamDocumentPath
 * @returns {(null|({rtcToken: string, rtmToken:string}))} Returns either null or an agora token object
 */
export function useAgoraToken(roomId, uid, isStreamer, securityToken, isScreenShareToken, streamDocumentPath) {
    const {asPath} = useRouter();

    const [agoraToken, setAgoraToken] = useState(null);
    const {getSecureAgoraToken} = useFirebase()
    const dispatch = useDispatch()
    const sendError = (message) => dispatch(actions.sendCustomError({
        message: message,
        options: {
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center',
            },
            key: message
        }
    }))

    useEffect(() => {
        setAgoraToken(null)
    }, [asPath]);


    useEffect(() => {
        if (roomId && uid) {
            (async function getSecureToken() {
                try {
                    const response = await getSecureAgoraToken({
                        isStreamer,
                        uid: isScreenShareToken ? uid + 'screen' : uid,
                        sentToken: securityToken,
                        channelName: roomId,
                        streamDocumentPath,
                    })
                    const {data} = response
                    if (data.status === 400) {
                        sendError(response.message)
                    }
                    if (data.status === 200) {
                        setAgoraToken(data.token)
                    }
                } catch (e) {
                    sendError(GENERAL_ERROR)
                }
            })()
        }
    }, [uid]);
    return agoraToken;
}