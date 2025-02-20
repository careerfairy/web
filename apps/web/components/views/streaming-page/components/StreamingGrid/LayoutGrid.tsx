import { Box, Grid } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { ReactNode, memo } from "react"
import { sxStyles } from "types/commonTypes"
import { DESKTOP_SPACING, MOBILE_SPACING } from "./GridCarousel"

const styles = sxStyles({
   item: {
      width: "100%",
      borderRadius: "10px",
      height: "100%",
   },
   gridItemSpotlight: {
      flex: "none !important",
      height: "100%",
      aspectRatio: "16 / 9",
   },
})

type Props<ElementType> = {
   elements: ElementType[]
   isLastButNotFirstPage: boolean
   layout: { columns: number; rows: number }
   renderGridItem: (
      element: ElementType,
      index: number,
      array: ElementType[]
   ) => ReactNode
}

/**
 * Calculates the adjusted height for the grid layout.
 * This adjustment is necessary to ensure the grid fits the content without stretching the last page.
 */
const calculateAdjustedHeight = (
   elementsLength: number,
   layout: { columns: number; rows: number },
   spacingValue: number
): string => {
   let adjustedHeight = `${
      (100 / layout.rows) * Math.ceil(elementsLength / layout.columns)
   }%`
   if (adjustedHeight !== "100%") {
      adjustedHeight = `calc(${adjustedHeight} - ${spacingValue * 4}px)`
   }
   return adjustedHeight
}

export const LayoutGrid = <ElementType,>({
   elements,
   isLastButNotFirstPage,
   layout,
   renderGridItem,
}: Props<ElementType>) => {
   const isMobile = useStreamIsMobile()

   const spacingValue = isMobile ? MOBILE_SPACING : DESKTOP_SPACING

   return (
      <Grid // Must double nest grid container, otherwise the height will not be respected, known mui bug
         container
         height={
            isLastButNotFirstPage
               ? calculateAdjustedHeight(elements.length, layout, spacingValue)
               : "100%"
         } // Use the adjusted height for the last page to avoid stretching the columns
      >
         <Grid
            container
            spacing={spacingValue}
            justifyContent={isLastButNotFirstPage ? "flex-start" : "center"}
         >
            {elements.map(renderGridItem)}
         </Grid>
      </Grid>
   )
}

type GalleryGridItemProps = {
   children: ReactNode
   layoutColumns: number
   /**
    * Key is mandatory as it is being rendered in a list
    */
   key: string | number
   isSpotlightMode: boolean
}

const LayoutGridItem = memo(
   ({ children, layoutColumns, isSpotlightMode }: GalleryGridItemProps) => (
      <Grid
         xs={12 / layoutColumns}
         item
         sx={isSpotlightMode ? styles.gridItemSpotlight : {}}
      >
         <Box sx={styles.item}>{children}</Box>
      </Grid>
   )
)

LayoutGridItem.displayName = "LayoutGridItem"

LayoutGrid.Item = LayoutGridItem
