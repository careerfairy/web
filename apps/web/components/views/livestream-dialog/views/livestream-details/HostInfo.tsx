import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { FC } from "react"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { sxStyles } from "../../../../../types/commonTypes"
import Skeleton from "@mui/material/Skeleton"
import CircularLogo from "components/views/common/CircularLogo"

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
   presenter: LivestreamPresenter
}
const HostInfo: FC<HostInfoProps> = ({ presenter }) => {
   return (
      <Stack spacing={1.5} direction="row">
         <CircularLogo
            src={presenter.companyLogoUrl}
            alt={presenter.company}
            size={73}
         />
         <Box sx={styles.companyNameWrapper}>
            <Typography fontWeight={300} variant={"body1"}>
               Hosted by
            </Typography>
            <Typography fontWeight={600} variant={"h5"}>
               {presenter.company}
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
