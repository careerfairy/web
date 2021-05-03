import {useState, useEffect} from "react";
import axios from 'axios';
import {useSnackbar} from "notistack";
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

    const [agoraToken, setAgoraToken] = useState(null);
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (roomId && uid) {
            axios({
                method: 'post',
                data: {
                    isStreamer: isStreamer,
                    uid: isScreenShareToken ? uid + 'screen' : uid,
                    token: securityToken,
                    channel: roomId,
                    streamDocumentPath
                },
                url: `http://localhost:5001/careerfairy-e1fd9/us-central1/generateAgoraTokenSecure`,
                // url: `https://us-central1-careerfairy-e1fd9.cloudfunctions.net/generateAgoraTokenSecure`,
            }).then(response => {
                console.log(response);
                if (response.data) {
                    setAgoraToken(response.data);
                }
            }).catch(error => {
                enqueueSnackbar("Invalid streamer link", {
                    variant: 'error',
                    preventDuplicate: true,
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                    },
                    persist: true
                })
                console.log(error);
            });
        }
    }, [roomId, uid]);
    return agoraToken;
}