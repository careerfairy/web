import { HygraphResponseHighlightList } from "../../../types/cmsTypes"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../types/commonTypes"
import HighlightsCarousel from "../../views/portal/HighlightsCarousel"
import React, { useMemo } from "react"
import { HighLight } from "@careerfairy/shared-lib/dist/highlights/Highlight"
import Container from "@mui/material/Container"
import { Typography } from "@mui/material"

const styles = sxStyles({
   wrapper: {
      px: { xs: 2, lg: 12 },
      paddingY: 6,
   },
   title: {
      textAlign: "center",
      mb: 4,
      fontWeight: 500,
   },
})

const HighlightList = ({
   highlightListTitle,
   highlights,
}: HygraphResponseHighlightList) => {
   const getMappedHighlights = useMemo((): HighLight[] => {
      return highlights?.map(
         (highlight) =>
            ({
               videoUrl: highlight.video?.url,
               id: highlight.slug,
               thumbnail: highlight.thumbnail?.url,
               logo: highlight.logo?.url,
               title: highlight.highlightTitle,
            } as HighLight)
      )
   }, [highlights])

   return (
      <Box sx={styles.wrapper}>
         <Container disableGutters>
            <Typography variant="h3" sx={styles.title}>
               {highlightListTitle}
            </Typography>
            <HighlightsCarousel
               showHighlights={true}
               serverSideHighlights={getMappedHighlights}
            />
         </Container>
      </Box>
   )
}

export default HighlightList
