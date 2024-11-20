import { Box } from "@mui/material"

import { SuspenseWithBoundary } from "components/ErrorBoundary"
import {
   HighlightComponentType,
   HighlightsBlockType,
   SparkComponentType,
} from "data/hygraph/types"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { HighlightCardSkeleton } from "./HighlightCardSkeleton"
import { SparkCard } from "./SparkCard"

const styles = sxStyles({
   root: {
      display: "grid",
      gridTemplateColumns: {
         xs: "repeat(2, 168px)",
         md: "repeat(2, 220px)",
      },
      gap: 1,
   },
})

type Props = HighlightsBlockType

const HighlightCardComponent = dynamic(() => import("./HighlightCard"), {
   ssr: false,
})

export const HighlightsBlock = ({ highlights }: Props) => {
   const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number>(0)

   const handleEndedPlaying = useCallback(() => {
      setCurrentPlayingIndex((prevIndex) => {
         return (prevIndex + 1) % highlights.length
      })
   }, [highlights.length])

   // Leaving this just for testing purposes so its easier for you to see
   useEffect(() => {
      const interval = setInterval(() => {
         setCurrentPlayingIndex((prevIndex) => {
            return (prevIndex + 1) % highlights.length
         })
      }, 1000)

      return () => clearInterval(interval)
   }, [highlights.length])

   return (
      <SuspenseWithBoundary fallback={<HighlightCardSkeleton />}>
         <Box sx={styles.root}>
            {highlights.map((highlight, index) => {
               const isSpark = highlight.__typename === "Spark"
               return (
                  <Box key={index}>
                     {isSpark ? (
                        <SparkCard
                           spark={highlight as SparkComponentType}
                           isPlaying={currentPlayingIndex === index}
                        />
                     ) : (
                        <HighlightCardComponent
                           highlight={highlight as HighlightComponentType}
                           isPlaying={currentPlayingIndex === index}
                           onEnded={handleEndedPlaying}
                        />
                     )}
                  </Box>
               )
            })}
         </Box>
      </SuspenseWithBoundary>
   )
}
