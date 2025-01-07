import { Box, Grow, Stack, Typography, useTheme } from "@mui/material"
import { LevelsIcon } from "components/views/common/icons/LevelsIcon"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { Clock } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { CTAButton } from "./CTAButton"
import { ProgressWithPercentage } from "./ProgressWithPercentage"

const styles = sxStyles({
   metadataIcon: {
      fontSize: 16,
   },
   ctaDesktop: {
      width: "100%",
   },
   ctaOverlay: (theme) => ({
      position: "fixed",
      bottom: 67,
      left: 0,
      right: 0,
      pb: 1.5,
      px: 1,
      zIndex: theme.zIndex.drawer + 1000,
      height: 85,
      display: "flex",
      alignItems: "end",
      justifyContent: "center",
      background:
         "linear-gradient(180deg, rgba(247, 248, 252, 0.00) 0%, rgba(247, 248, 252, 0.90) 100%)",
      "& > *": {
         maxWidth: 500,
      },
      m: "0px !important", // override margin from Stack component
   }),
})

const calculateTotalHours = (levels: Page<TalentGuideModule>[]) => {
   const totalMinutes = levels.reduce((sum, level) => {
      if (!level.content?.estimatedModuleDurationMinutes) return sum
      return sum + level.content.estimatedModuleDurationMinutes
   }, 0)

   return Math.ceil(totalMinutes / 60)
}

type Props = {
   levels: Page<TalentGuideModule>[]
   /**
    * Whether the component is overlaying the illustration
    * If true, the component will have contrast with the illustration
    */
   isOverlay: boolean
   nextLevel: Page<TalentGuideModule> | null
   copy: {
      title: string
      description: string
   }
   overallProgress: number
}

export const CourseDetails = ({
   levels,
   isOverlay,
   nextLevel,
   copy,
   overallProgress,
}: Props) => {
   const theme = useTheme()
   const hours = calculateTotalHours(levels)

   return (
      <Stack
         p={2}
         spacing={2}
         color={isOverlay ? theme.brand.white[50] : "neutral.600"}
      >
         <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
         >
            <Stack spacing={0.5}>
               <Typography
                  fontWeight={700}
                  variant="desktopBrandedH4"
                  component="h4"
               >
                  {copy.title}
               </Typography>
               <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                     <LevelsIcon sx={styles.metadataIcon} isOutlined />
                     <Typography
                        variant={isOverlay ? "xsmall" : "small"}
                        component="p"
                     >
                        {levels.length} levels
                     </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                     <Clock size={16} />
                     <Typography
                        variant={isOverlay ? "xsmall" : "small"}
                        component="p"
                     >
                        {hours} hour{hours !== 1 ? "s" : ""}
                     </Typography>
                  </Stack>
               </Stack>
            </Stack>
            <ProgressWithPercentage
               isOverlay={isOverlay}
               percentageComplete={overallProgress}
            />
         </Stack>

         {isOverlay ? null : (
            <Typography variant={"medium"} component="p" color="neutral.700">
               {copy.description}
            </Typography>
         )}
         <Grow unmountOnExit in={Boolean(nextLevel)}>
            <Box sx={isOverlay ? styles.ctaOverlay : styles.ctaDesktop}>
               <CTAButton nextLevel={nextLevel} />
            </Box>
         </Grow>
      </Stack>
   )
}
