import { Box, Stack, Typography } from "@mui/material"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { useAuth } from "HOCs/AuthProvider"
import { useOverallTalentGuideProgress } from "hooks/useOverallTalentGuideProgress"
import { sxStyles } from "types/commonTypes"
import { CourseDetails } from "./CourseDetails"
import { CourseIllustration } from "./CourseIllustration"

const styles = sxStyles({
   root: {
      width: "100%",
      maxWidth: 360,
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "start",
   },
   rootMobile: {
      maxWidth: "100%",
   },
   content: {
      width: "100%",
      position: "sticky",
      top: 64, // offset for sticky header
   },
   contentMobile: {
      backgroundColor: "none",
      position: "static",
   },
   contentInner: (theme) => ({
      border: `1px solid ${theme.palette.secondary[50]}`,
      backgroundColor: theme.brand.white[100],
      borderRadius: "8px",
   }),
   detailsOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
   },
   contentInnerMobile: {
      backgroundColor: "none",
   },
   description: {
      px: 1,
      pt: 1,
      color: "neutral.700",
   },
})

type Props = {
   modules: Page<TalentGuideModule>[]
   isMobile: boolean
}

const copy = {
   title: "Kickstarte deine Karriere",
   description:
      "Bereit für den Berufseinstieg? Lerne von echten Profis die Insider Tipps und erprobte Strategien, die du brauchst um den super kompetitiven Jobmarkt zu navigieren. Für eine erfolgreiche Karriere, die du verdienst!",
}

export const CourseOverview = ({ modules, isMobile }: Props) => {
   const { authenticatedUser } = useAuth()

   const { data: overallProgress = 0 } = useOverallTalentGuideProgress(
      authenticatedUser.uid,
      modules
   )

   return (
      <Box sx={[styles.root, isMobile && styles.rootMobile]}>
         <Box sx={[styles.content, isMobile && styles.contentMobile]}>
            <Stack
               sx={[styles.contentInner, isMobile && styles.contentInnerMobile]}
            >
               <CourseIllustration isMobile={isMobile}>
                  {isMobile ? (
                     <Box sx={styles.detailsOverlay}>
                        <CourseDetails
                           isOverlay
                           levels={modules}
                           copy={copy}
                           overallProgress={overallProgress}
                        />
                     </Box>
                  ) : null}
               </CourseIllustration>
               {isMobile ? null : (
                  <CourseDetails
                     isOverlay={isMobile}
                     levels={modules}
                     copy={copy}
                     overallProgress={overallProgress}
                  />
               )}
            </Stack>
            {isMobile ? (
               <Typography
                  variant={"small"}
                  component="p"
                  sx={styles.description}
               >
                  {copy.description}
               </Typography>
            ) : null}
         </Box>
      </Box>
   )
}
