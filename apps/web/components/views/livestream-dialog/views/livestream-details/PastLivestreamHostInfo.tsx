import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import Link from "components/views/common/Link"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { FC, useMemo } from "react"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   logoWrapper: {
      p: 1,
      background: "white",
      borderRadius: 50,
      display: "flex",
   },
   companyNameWrapper: {
      display: "flex",
      justifyContent: "flex-start",
      flexDirection: "column",
   },
   logoSkeleton: {
      borderRadius: 50,
   },
   companyName: {
      fontSize: "14px",
      fontWeight: 400,
      fontFamily: "Poppins",
      color: "neutral.800",
   },
   livestreamTitle: {
      fontSize: "18px",
      fontWeight: 600,
      fontFamily: "Poppins",
      color: "neutral.800",
   },
})

type PastLivestreamHostInfoProps = {
   presenter: LivestreamPresenter
   livestreamTitle: string
}

const PastLivestreamHostInfo: FC<PastLivestreamHostInfoProps> = (props) => {
   return (
      <SuspenseWithBoundary fallback={<PastLivestreamHostInfoSkeleton />}>
         <PastLivestreamHostInfoComponent {...props} />
      </SuspenseWithBoundary>
   )
}

const PastLivestreamHostInfoComponent: FC<PastLivestreamHostInfoProps> = ({
   presenter,
   livestreamTitle,
}) => {
   const { data: company, isLoading } = useLivestreamCompanyHostSWR(
      presenter.id
   )

   const companyPresenter = useMemo(
      () => (company ? GroupPresenter.createFromDocument(company) : null),
      [company]
   )

   const isCompanyPagePublic =
      !isLoading && Boolean(companyPresenter?.publicProfile)

   const companyName = (
      <Typography sx={styles.companyName}>{presenter.company}</Typography>
   )

   return (
      <Stack spacing={2} alignItems="flex-start">
         {/* Row 1: Logo and Company Name */}
         <Stack spacing={1.5} direction="row" alignItems="center">
            <CircularLogo
               src={presenter.companyLogoUrl}
               alt={presenter.company}
               size={28}
               href={
                  isCompanyPagePublic
                     ? makeGroupCompanyPageUrl(company.universityName, {
                          interactionSource:
                             InteractionSources.Live_Stream_Details,
                       })
                     : null
               }
            />
            <Box sx={styles.companyNameWrapper}>
               {isCompanyPagePublic ? (
                  <Box
                     component={Link}
                     noLinkStyle
                     href={makeGroupCompanyPageUrl(company.universityName, {
                        interactionSource:
                           InteractionSources.Live_Stream_Details,
                     })}
                     sx={styles.companyName}
                  >
                     {companyName}
                  </Box>
               ) : (
                  companyName
               )}
            </Box>
         </Stack>

         {/* Row 2: Livestream Title */}
         <Typography sx={styles.livestreamTitle}>{livestreamTitle}</Typography>
      </Stack>
   )
}

const PastLivestreamHostInfoSkeleton: FC = () => {
   return (
      <Stack spacing={2} alignItems="flex-start">
         <Stack spacing={1.5} direction="row" alignItems="center">
            <Skeleton
               variant="circular"
               width={28}
               height={28}
               sx={styles.logoSkeleton}
            />
            <Skeleton variant="text" width={120} height={20} />
         </Stack>
         <Skeleton variant="text" width={200} height={24} />
      </Stack>
   )
}

export default PastLivestreamHostInfo
