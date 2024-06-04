import { Stack, Typography } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import CircularLogo from "components/views/common/logos/CircularLogo"
import {
   useCompanyLogoUrl,
   useCompanyName,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      alignItems: "center",
   },
   hostedBy: {
      color: "text.secondary",
   },
   companyName: {
      color: "neutral.800",
      fontWeight: 600,
   },
})

export const HostDetails = () => {
   const companyLogoUrl = useCompanyLogoUrl()
   const companyName = useCompanyName()
   const streamIsMobile = useStreamIsMobile()

   return (
      <Stack sx={styles.root} direction="row" spacing={1.5}>
         <CircularLogo src={companyLogoUrl} alt={companyName} size={64} />
         <Stack spacing={-0.375}>
            <Typography
               variant={streamIsMobile ? "xsmall" : "medium"}
               sx={styles.hostedBy}
            >
               Hosted by
            </Typography>
            <Typography
               variant={streamIsMobile ? "medium" : "desktopBrandedH4"}
               sx={styles.companyName}
            >
               {companyName}
            </Typography>
         </Stack>
      </Stack>
   )
}
