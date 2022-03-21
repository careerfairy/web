import { useEffect, useState } from "react"
import { getBaseUrl } from "../helperFunctions/HelperFunctions"
import { useRouter } from "next/router"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import useStreamRef from "./useStreamRef"

/**
 * Get the stream token.
 * @param {Object} options - The configurations optionObject
 * @param {string|'mainLivestream'|'breakoutRoom'} options.forStreamType - The type of stream you would like the token for.
 * @param {string} [options.targetBreakoutRoomId] - The id of a particular breakout room you are looking for.
 * @returns {({streamToken: string, mainStreamerLink: string, joiningStreamerLink: string, viewerLink: string})} Returns the 3 stream link types
 */
const useStreamToken = (
   options = { forStreamType: "", targetBreakoutRoomId: "" }
) => {
   const {
      query: { livestreamId, breakoutRoomId },
   } = useRouter()
   const streamRef = useStreamRef()
   const {
      getStreamTokenWithRef,
      getLivestreamSecureToken,
      getBreakoutRoomSecureToken,
   } = useFirebaseService()
   const [streamToken, setStreamToken] = useState("")
   const [mainStreamerLink, setMainStreamerLink] = useState("")
   const [joiningStreamerLink, setJoiningStreamerLink] = useState("")
   const [viewerLink, setViewerLink] = useState("")

   useEffect(() => {
      if (livestreamId) {
         ;(async function getToken() {
            let tokenDoc
            let breakoutRoomPath
            if (
               options.forStreamType === "breakoutRoom" &&
               options.targetBreakoutRoomId
            ) {
               tokenDoc = await getBreakoutRoomSecureToken(
                  livestreamId,
                  options.targetBreakoutRoomId
               )
               breakoutRoomPath = `breakout-room/${options.targetBreakoutRoomId}/`
            } else if (options.forStreamType === "mainLivestream") {
               tokenDoc = await getLivestreamSecureToken(livestreamId)
               breakoutRoomPath = ""
            } else {
               tokenDoc = await getStreamTokenWithRef(streamRef)
               breakoutRoomPath = breakoutRoomId
                  ? `breakout-room/${breakoutRoomId}/`
                  : ``
            }
            const secureToken = tokenDoc.data?.()?.value || ""
            const tokenPath = secureToken ? `?token=${secureToken}` : ""
            setStreamToken(secureToken)
            const baseUrl = getBaseUrl()
            setMainStreamerLink(
               `${baseUrl}/streaming/${livestreamId}/${breakoutRoomPath}main-streamer${tokenPath}`
            )
            setJoiningStreamerLink(
               `${baseUrl}/streaming/${livestreamId}/${breakoutRoomPath}joining-streamer${tokenPath}`
            )
            setViewerLink(
               `${baseUrl}/streaming/${livestreamId}/${breakoutRoomPath}viewer`
            )
         })()
      }
   }, [livestreamId, breakoutRoomId, options.forStreamType])

   return { streamToken, mainStreamerLink, joiningStreamerLink, viewerLink }
}

export default useStreamToken
