import { Box, Button, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"
import { CourseIllustration } from "./CourseIllustration"

const styles = sxStyles({
   root: {
      width: "100%",
      maxWidth: {
         xs: "100%",
         sm: 360,
      },
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "start",
   },
   content: {
      width: "100%",
      position: "sticky",
      top: 64, // offset for sticky header
   },

   details: {
      padding: 2,
   },
   metadata: {
      color: "secondary.600",
   },
   description: {
      color: "secondary.700",
      marginBottom: 2,
   },
   startButton: {
      width: "100%",
   },
})

type Props = {
   pages: Page<TalentGuideModule>[]
}

const copy = {
   title: "Quick start your career",
   description:
      "Ready to land your dream job? Learn the insider tips and practical strategies to stand out in today's competitive job market. Start building the career you deserve!",
}

export const CourseOverview = ({ pages }: Props) => {
   const isMobile = useIsMobile("sm")

   return (
      <Box sx={styles.root}>
         <Stack sx={styles.content}>
            <CourseIllustration isMobile={isMobile} />
            <Stack sx={styles.details} spacing={2}>
               <Typography variant="h4">{copy.title}</Typography>
               <Typography variant="body2" sx={styles.metadata}>
                  {pages.length} levels • 2 hours
               </Typography>
               <Typography variant="body1" sx={styles.description}>
                  {copy.description}
               </Typography>
               <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={styles.startButton}
                  href={`/levels/${pages[0]?.slug}`}
               >
                  Start course 1
               </Button>
            </Stack>
         </Stack>
      </Box>
   )
}
