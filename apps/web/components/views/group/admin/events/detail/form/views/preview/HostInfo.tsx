import { sxStyles } from "@careerfairy/shared-ui"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import CircularLogo from "components/views/common/logos/CircularLogo"

const styles = sxStyles({
   logoWrapper: {
      p: 1,
      background: "white",
      borderRadius: 50,
      display: "flex",
   },
   companyNameWrapper: {
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
   },
   logoSkeleton: {
      borderRadius: 50,
   },
})

type HostInfoProps = {
   companyName: string
   companyLogoUrl: string
}

const HostInfo = ({ companyName, companyLogoUrl }: HostInfoProps) => {
   return (
      <Stack spacing={1.5} direction="row">
         <CircularLogo src={companyLogoUrl} alt={companyName} size={73} />
         <Box sx={styles.companyNameWrapper}>
            <Typography fontWeight={300} variant={"body1"}>
               Hosted by
            </Typography>
            <Typography fontWeight={600} variant={"h5"}>
               {companyName}
            </Typography>
         </Box>
      </Stack>
   )
}

export const HostInfoSkeleton = () => {
   return (
      <Stack spacing={1.5} direction="row">
         <Skeleton
            sx={styles.logoSkeleton}
            variant={"circular"}
            width={50}
            height={50}
         />
         <Box sx={styles.companyNameWrapper}>
            <Typography fontWeight={300} variant={"body1"}>
               <Skeleton width={70} />
            </Typography>
            <Typography fontWeight={600} variant={"h5"}>
               <Skeleton width={120} />
            </Typography>
         </Box>
      </Stack>
   )
}

export default HostInfo
