import { Box } from "@mui/material"

import { SuspenseWithBoundary } from "components/ErrorBoundary"
import {
   HighlightComponentType,
   HighlightsBlockType,
   SparkComponentType,
} from "data/hygraph/types"
import dynamic from "next/dynamic"
import { sxStyles } from "types/commonTypes"
import { HighlightCardSkeleton } from "./HighlightCardSkeleton"
import { HighlightsProvider } from "./HighlightsBlockContext"
import { SparkCard } from "./SparkCard"

const styles = sxStyles({
   root: {
      display: "grid",
      gridTemplateColumns: {
         xs: "repeat(2, minmax(0, 1fr))",
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
   return (
      <HighlightsProvider highlights={highlights}>
         <Box sx={styles.root}>
            {highlights.map((highlight, index) => {
               const isSpark = highlight.__typename === "Spark"
               return (
                  <SuspenseWithBoundary
                     fallback={<HighlightCardSkeleton />}
                     key={index}
                  >
                     {isSpark ? (
                        <SparkCard
                           spark={highlight as SparkComponentType}
                           index={index}
                        />
                     ) : (
                        <HighlightCardComponent
                           highlight={highlight as HighlightComponentType}
                           index={index}
                        />
                     )}
                  </SuspenseWithBoundary>
               )
            })}
         </Box>
      </HighlightsProvider>
   )
}
