import React from "react"
import { sxStyles } from "types/commonTypes"
import { FloatingContent } from "./VideoTrackWrapper"

const styles = sxStyles({
   root: {
      borderRadius: "inherit",
      transition: (theme) => theme.transitions.create("border"),
   },
   speaking: {
      border: "2.5px solid #00D2AA",
   },
})

type Props = {
   isSpeaking: boolean
}
export const SpeakingIndicator = ({ isSpeaking }: Props) => {
   return (
      <FloatingContent
         id="speaking-indicator"
         sx={[styles.root, isSpeaking && styles.speaking]}
      />
   )
}
