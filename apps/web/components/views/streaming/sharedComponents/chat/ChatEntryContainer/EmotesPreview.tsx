import React, { useEffect, useState } from "react"
import {
   heartPng,
   laughingPng,
   thumbsUpPng,
   wowPng,
} from "../EmotesModal/utils"
import { Paper, Typography, Zoom } from "@mui/material"
import { LivestreamChatEntry } from "@careerfairy/shared-lib/dist/livestreams"
import Image from "next/legacy/image"
import { sxStyles } from "../../../../../../types/commonTypes"

const styles = sxStyles({
   emotesPreviewPaperWrapper: {
      zIndex: 1,
      cursor: "pointer",
      bottom: "-10px !important",
      display: "flex",
      boxShadow: 3,
      alignItems: "center",
      zChatEntryContainer: 1,
      padding: 0.1,
      position: "absolute",
      right: 0,
      overflow: "hidden",
      borderRadius: 2,
      "&  > *": (theme) => ({
         margin: (theme) => `0 ${theme.spacing(0.3)} !important`,
      }),
   },
   totalText: {
      fontSize: 10,
   },
})

type Props = {
   chatEntry: LivestreamChatEntry
   onClick: () => void
}
type Emote = {
   src: string
   alt: string
   prop: string
   data: string[]
}
const EmotesPreview = ({
   chatEntry: { wow, heart, thumbsUp, laughing },
   onClick,
}: Props) => {
   const [emotes, setEmotes] = useState<Emote[]>([])

   const [total, setTotal] = useState<number>(0)

   useEffect(() => {
      const newEmotes: Emote[] = [
         {
            src: laughingPng.src,
            alt: laughingPng.alt,
            prop: "laughing",
            data: laughing,
         },
         {
            src: wowPng.src,
            alt: wowPng.alt,
            prop: "wow",
            data: wow,
         },
         {
            src: heartPng.src,
            alt: heartPng.alt,
            prop: "heart",
            data: heart,
         },
         {
            src: thumbsUpPng.src,
            alt: thumbsUpPng.alt,
            prop: "thumbsUp",
            data: thumbsUp,
         },
      ].filter((emote) => emote.data?.length)
      const newTotal = newEmotes.reduce(
         (acc, curr) => acc + (curr.data.length || 0),
         0
      )
      setEmotes(newEmotes)
      setTotal(newTotal)
   }, [wow, heart, thumbsUp, laughing])

   return (
      <Zoom unmountOnExit mountOnEnter in={Boolean(emotes.length)}>
         <Paper onClick={onClick} sx={styles.emotesPreviewPaperWrapper}>
            {emotes.map(({ alt, src, prop }) => (
               <Image key={prop} alt={alt} width={12} height={12} src={src} />
            ))}
            <Typography sx={styles.totalText}>{total || 0}</Typography>
         </Paper>
      </Zoom>
   )
}

export default EmotesPreview
