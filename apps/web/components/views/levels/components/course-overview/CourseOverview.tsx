import {
   Box,
   Button,
   ButtonProps,
   Grow,
   Stack,
   Typography,
   useTheme,
} from "@mui/material"
import { LevelsIcon } from "components/views/common/icons/LevelsIcon"
import Link from "components/views/common/Link"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { useAuth } from "HOCs/AuthProvider"
import { useNextTalentGuideModule } from "hooks/useNextTalentGuideModule"
import { forwardRef } from "react"
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
      backgroundColor: "none",
      position: "static",
   },

   details: {
      padding: 2,
   },
   detailsMobile: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 2,
   },
   metadataIcon: {
      fontSize: 16,
   },
   startButtonDesktop: {
      width: "100%",
   },
   startButtonMobile: (theme) => ({
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
   }),
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
   const { authenticatedUser } = useAuth()
   const { data: nextModule } = useNextTalentGuideModule(authenticatedUser.uid)

   return (
      <Box sx={[styles.root, isMobile && styles.rootMobile]}>
         <Stack sx={[styles.content, isMobile && styles.contentMobile]}>
            <CourseIllustration isMobile={isMobile} />
            <Stack
               sx={[styles.details, isMobile && styles.detailsMobile]}
               spacing={2}
               color={isMobile ? theme.brand.white[50] : "neutral.600"}
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

               {isMobile ? null : (
                  <Typography variant={"medium"} component="p">
                     {copy.description}
                  </Typography>
               )}
               <Grow unmountOnExit in={Boolean(nextModule && !isMobile)}>
                  <Box>
                     <CTAButton nextModule={pages[0]} />
                  </Box>
               </Grow>
            </Stack>
         </Stack>
         <Grow unmountOnExit in={Boolean(nextModule && isMobile)}>
            <Box sx={styles.startButtonMobile}>
               <CTAButton nextModule={pages[0]} />
            </Box>
         </Grow>
      </Box>
   )
}

type CTAButtonProps = ButtonProps & {
   nextModule: Page<TalentGuideModule>
}

const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
   ({ nextModule, ...props }, ref) => {
      return (
         <Button
            ref={ref}
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            component={Link}
            noLinkStyle
            href={`/levels/${nextModule.slug}`}
            {...props}
         >
            Start course {nextModule.content.level}
         </Button>
      )
   }
)

CTAButton.displayName = "CTAButton"
