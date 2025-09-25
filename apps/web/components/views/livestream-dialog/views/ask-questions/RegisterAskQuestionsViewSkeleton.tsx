import { FC } from "react"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { Skeleton } from "@mui/material"
import { QuestionsSkeleton } from "../livestream-details/main-content/Questions"
import Paper from "@mui/material/Paper"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "@careerfairy/shared-ui"

const styles = sxStyles({
   contentOffset: {
      mt: { xs: -7.8, md: -15 },
      spacing: 2,
      width: "100%",
   },
   hero: {
      pb: { xs: 2, md: 9 },
      pt: { xs: 0, md: 1 },
      alignItems: "center",
      spacing: 1.75,
   },
   heroText: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      maxWidth: 655,
      width: "100%",
   },
   inputBox: {
      width: "90%",
      borderRadius: 2,
      height: 120,
      display: "flex",
      flexDirection: "column",
      justifyContent: "end",
      boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.04)",
      border: "1px solid #DCDCDC",
   },
   inputWrapper: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
})

const RegisterAskQuestionsViewSkeleton: FC = () => {
   const isMobile = useIsMobile()
   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               onBackPosition={"top-left"}
               onBackClick={() => {}}
               noMinHeight
            >
               <Stack sx={styles.hero}>
                  <Box
                     component={Skeleton}
                     variant={"circular"}
                     width={isMobile ? 80 : 104}
                     height={isMobile ? 80 : 104}
                  />
                  <Box component={Typography} sx={styles.heroText} variant="h2">
                     <Skeleton width="60%" />
                     <Box component={Skeleton} mx="auto" width="50%" />
                  </Box>
               </Stack>
            </HeroContent>
         }
         mainContent={
            <MainContent>
               <Stack sx={styles.contentOffset}>
                  <Box sx={styles.inputWrapper}>
                     <Box sx={styles.inputBox} component={Paper} />
                  </Box>
                  <QuestionsSkeleton />
               </Stack>
            </MainContent>
         }
         fixedBottomContent={<Skeleton variant="rectangular" height={56} />}
      />
   )
}

export default RegisterAskQuestionsViewSkeleton
