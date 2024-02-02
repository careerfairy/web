import { Box, Button, ButtonGroup } from "@mui/material"
import { useState } from "react"
import { sxStyles } from "types/commonTypes"
import { GridCarousel } from "../GridCarousel"
import { LayoutGrid } from "../LayoutGrid"
import { useGalleryLayout } from "./useGalleryLayout"
import { usePaginatedGridLayout } from "../hooks/usePaginatedGridLayout"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
   },

   demoToggle: {
      position: "fixed",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      p: 2,
   },
})

const generateRemoteStreamers = (count: number): number[] => {
   // Generates an array of unique numbers starting from 1 up to `count`
   return Array.from({ length: count }, (_, index) => index + 1)
}

export const GalleryLayout = () => {
   // Dummy data generation for demo
   const [numStreamers, setNumStreamers] = useState(2)
   const remoteStreamers = generateRemoteStreamers(numStreamers)

   const layout = useGalleryLayout(remoteStreamers.length)
   const gridPages = usePaginatedGridLayout(remoteStreamers, layout)

   return (
      <Box sx={styles.root}>
         <Box sx={styles.demoToggle}>
            {/* Demo button to change the number of streamers */}
            <ButtonGroup size="small" disableElevation variant="contained">
               <Button
                  disabled={numStreamers === 1}
                  onClick={() => setNumStreamers(numStreamers - 1)}
               >
                  Decrease
               </Button>
               <Button onClick={() => setNumStreamers(numStreamers + 1)}>
                  Increase
               </Button>
            </ButtonGroup>
         </Box>
         <GridCarousel
            gridPages={gridPages.map((pageStreamers, pageIndex) => (
               <LayoutGrid
                  key={pageIndex}
                  elements={pageStreamers}
                  isLastButNotFirstPage={
                     pageIndex === gridPages.length - 1 && pageIndex !== 0
                  }
                  layout={layout}
                  renderGridItem={(element) => (
                     <LayoutGrid.Item
                        key={element}
                        layoutColumns={layout.columns}
                     >
                        {element}
                     </LayoutGrid.Item>
                  )}
               />
            ))}
         />
      </Box>
   )
}
