import { HighLight } from "@careerfairy/shared-lib/highlights/Highlight"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import { useMemo } from "react"
import { HygraphResponseHighlightList } from "../../../types/cmsTypes"
import { sxStyles } from "../../../types/commonTypes"
import HighlightsCarousel from "../../views/portal/HighlightsCarousel"

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
            <Typography variant="h2" sx={styles.title}>
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
