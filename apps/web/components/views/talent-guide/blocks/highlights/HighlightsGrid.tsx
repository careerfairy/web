import { Box } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { HighlightComponentType, SparkComponentType } from "data/hygraph/types"
import dynamic from "next/dynamic"
import { sxStyles } from "types/commonTypes"
import { HighlightCardSkeleton } from "./HighlightCardSkeleton"
import { useHighlights } from "./control/HighlightsBlockContext"

const styles = sxStyles({
   root: {
      display: "grid",
      gridTemplateColumns: {
         xs: "repeat(2, minmax(0, 1fr))",
         md: "repeat(2, 220px)",
      },
      gap: 1,
      justifyContent: "center",
      width: "100%",
   },
})

const SparkCardComponent = dynamic(() => import("./SparkCard"), {
   ssr: false,
})

const HighlightCardComponent = dynamic(() => import("./HighlightCard"), {
   ssr: false,
})

export const HighlightsGrid = () => {
   const { highlights } = useHighlights()
   return (
      <Box data-testid="highlights-grid" sx={styles.root}>
         {highlights.map((highlight, index) => {
            const isSpark = highlight.__typename === "Spark"
            return (
               <SuspenseWithBoundary
                  fallback={<HighlightCardSkeleton />}
                  hide
                  key={index}
               >
                  {isSpark ? (
                     <SparkCardComponent
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
   )
}
