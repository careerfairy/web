import { sxStyles } from "@careerfairy/shared-ui"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import CircularLogo from "components/views/common/logos/CircularLogo"
import StaticSkeleton from "./StaticSkeleton"

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
         {companyLogoUrl ? (
            <CircularLogo src={companyLogoUrl} alt={companyName} size={73} />
         ) : (
            <LogoSkeleton />
         )}
         {companyName ? (
            <Box sx={styles.companyNameWrapper}>
               <Typography fontWeight={300} variant={"body1"}>
                  Hosted by
               </Typography>
               <Typography fontWeight={600} variant={"h5"}>
                  {companyName}
               </Typography>
            </Box>
         ) : (
            <CompanyNameSkeleton />
         )}
      </Stack>
   )
}

const CompanyNameSkeleton = () => {
   return (
      <Box sx={styles.companyNameWrapper}>
         <Typography fontWeight={300} variant={"body1"}>
            <StaticSkeleton width={70} />
         </Typography>
         <Typography fontWeight={600} variant={"h5"}>
            <StaticSkeleton width={120} />
         </Typography>
      </Box>
   )
}

const LogoSkeleton = () => {
   return (
      <StaticSkeleton
         sx={styles.logoSkeleton}
         variant={"circular"}
         width={50}
         height={50}
      />
   )
}

export default HostInfo
