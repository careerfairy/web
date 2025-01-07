import { Box, Button, Stack, Typography, useTheme } from "@mui/material"
import { LevelsIcon } from "components/views/common/icons/LevelsIcon"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { Clock } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { CourseIllustration } from "./CourseIllustration"
import { ProgressWithPercentage } from "./ProgressWithPercentage"

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
   content: (theme) => ({
      width: "100%",
      position: "sticky",
      top: 64, // offset for sticky header
      border: `1px solid ${theme.palette.secondary[50]}`,
      backgroundColor: theme.brand.white[100],
      borderRadius: "8px",
   }),
   contentMobile: {
      border: "none",
      backgroundColor: "none",
   },

   details: {
      padding: 2,
   },
   metadataIcon: {
      fontSize: 16,
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
   isMobile: boolean
}

const copy = {
   title: "Quick start your career",
   description:
      "Ready to land your dream job? Learn the insider tips and practical strategies to stand out in today's competitive job market. Start building the career you deserve!",
}

export const CourseOverview = ({ pages, isMobile }: Props) => {
   const theme = useTheme()

   return (
      <Box sx={[styles.root, isMobile && styles.rootMobile]}>
         <Stack sx={[styles.content, isMobile && styles.contentMobile]}>
            <CourseIllustration isMobile={isMobile} />
            <Stack sx={styles.details} spacing={2}>
               <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
               >
                  <Stack
                     color={isMobile ? theme.brand.white[50] : "neutral.600"}
                     spacing={0.5}
                  >
                     <Typography
                        fontWeight={700}
                        variant="desktopBrandedH4"
                        component="h4"
                     >
                        {copy.title}
                     </Typography>
                     <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Stack
                           direction="row"
                           alignItems="center"
                           spacing={0.5}
                        >
                           <LevelsIcon sx={styles.metadataIcon} isOutlined />
                           <Typography
                              variant={isMobile ? "xsmall" : "small"}
                              component="p"
                           >
                              {pages.length} levels
                           </Typography>
                        </Stack>
                        <Stack
                           direction="row"
                           alignItems="center"
                           spacing={0.5}
                        >
                           <Clock size={16} />
                           <Typography variant="body2">2 hours</Typography>
                        </Stack>
                     </Stack>
                  </Stack>
                  <ProgressWithPercentage
                     isOverlay={isMobile}
                     percentageComplete={75}
                  />
               </Stack>
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
