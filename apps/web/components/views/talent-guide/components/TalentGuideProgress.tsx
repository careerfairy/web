import { Box, LinearProgress, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import Link from "next/link"
import { X as BackIcon } from "react-feather"
import {
   useProgress,
   useTalentGuideTitle,
} from "store/selectors/talentGuideSelectors"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
   },
   container: {
      maxWidth: "100%",
      px: 1.5,
      pt: 2,
      pb: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   containerDesktop: {
      px: 1.5,
      py: 4,
   },
   title: {
      mt: 1,
      fontWeight: 700,
   },
   progress: {
      width: "100%",
      height: 12,
      borderRadius: "26px",
      bgcolor: (theme) => theme.palette.neutral[50],
      "& .MuiLinearProgress-bar": {
         borderRadius: "26px",
      },
   },
   progressWrapper: {
      pt: "auto",
      my: 0.5,
      width: "100%",
   },
   backIcon: {
      display: "flex",
      textDecoration: "none",
      color: "inherit",
   },
})

export const TalentGuideProgress = () => {
   const title = useTalentGuideTitle()
   const progress = useProgress()
   const isMobile = useIsMobile()

   return (
      <Box sx={styles.root}>
         <Box sx={isMobile ? styles.container : styles.containerDesktop}>
            <Stack
               direction="row"
               spacing={1.5}
               alignItems="center"
               sx={styles.progressWrapper}
            >
               <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={styles.progress}
               />
               <Box sx={styles.backIcon} component={Link} href="/levels">
                  <BackIcon size={20} />
               </Box>
            </Stack>
            <Typography variant="brandedH5" sx={styles.title}>
               {title}
            </Typography>
         </Box>
      </Box>
   )
}
