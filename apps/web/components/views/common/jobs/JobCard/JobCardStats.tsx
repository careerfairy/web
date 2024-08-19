import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { CheckCircle, User } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   stats: (theme) => ({
      background: theme.brand.white[200],
      border: `1px solid ${theme.brand.black[300]}`,
      borderRadius: "62px",
      p: "12px 20px",
      alignItems: "center",
      justifyContent: "space-between",
   }),
   statsLabel: {
      color: (theme) => theme.palette.neutral[400],
   },
   initialized: {
      display: "flex",
      alignItems: "center",

      "& svg": {
         color: "grey",
         mr: 1,
      },
   },
   applications: {
      display: "flex",
      alignItems: "center",

      "& svg": {
         color: "secondary.main",
         mr: 1,
      },
   },
   mobileStats: (theme) => ({
      display: "flex",
      flexDirection: "column",
      width: "100%",
      background: theme.brand.white[200],
      border: `1px solid ${theme.brand.black[300]}`,
      py: 1,
   }),
   mobileStatsValues: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-evenly",
   },
})

type Props = {
   clicks: number
   applicants: number
}
const JobCardStats = ({ clicks, applicants }: Props) => {
   const isMobile = useIsMobile()

   return isMobile ? (
      <MobileStats clicks={clicks} applicants={applicants} />
   ) : (
      <Stack spacing={2} sx={styles.stats} direction="row">
         <Typography sx={styles.statsLabel}>Applications:</Typography>

         <Box sx={styles.initialized}>
            <User size={16} />
            <Typography variant={"subtitle1"} color={"text.secondary"}>
               {clicks} Initiated
            </Typography>
         </Box>

         <Box sx={styles.applications}>
            <CheckCircle size={16} />
            <Typography variant={"subtitle1"} color={"secondary.main"}>
               {applicants} Confirmed
            </Typography>
         </Box>
      </Stack>
   )
}

type MobileStatsProps = {
   clicks: number
   applicants: number
}
const MobileStats = ({ clicks, applicants }: MobileStatsProps) => (
   <Box sx={styles.mobileStats}>
      <Box sx={styles.mobileStatsValues}>
         <Box sx={styles.initialized}>
            <User size={16} />
            <Typography variant={"subtitle1"} color={"text.secondary"}>
               {clicks} Initiated
            </Typography>
         </Box>

         <Box sx={styles.applications}>
            <CheckCircle size={16} />
            <Typography variant={"subtitle1"} color={"secondary.main"}>
               {applicants} Confirmed
            </Typography>
         </Box>
      </Box>
   </Box>
)

export default JobCardStats
