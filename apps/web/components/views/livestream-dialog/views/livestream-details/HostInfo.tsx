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

const HostInfo: FC<HostInfoProps> = (props) => {
   return (
      <SuspenseWithBoundary fallback={<HostInfoSkeleton />}>
         <HostInfoComponent {...props} />
      </SuspenseWithBoundary>
   )
}

const HostInfoComponent: FC<HostInfoProps> = ({ presenter }) => {
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
      <Typography fontWeight={600} variant={"brandedH4"}>
         {presenter.company}
      </Typography>
   )

   return (
      <Stack spacing={1.5} direction="row">
         <CircularLogo
            src={presenter.companyLogoUrl}
            alt={presenter.company}
            size={73}
            href={
               isCompanyPagePublic
                  ? makeGroupCompanyPageUrl(
                       company.universityName,
                       InteractionSources.Live_Stream_Details
                    )
                  : null
            }
         />
         <Box sx={styles.companyNameWrapper}>
            <Typography fontWeight={300} variant={"body1"}>
               Hosted by
            </Typography>

            {isCompanyPagePublic ? (
               <Box
                  component={Link}
                  noLinkStyle
                  href={makeGroupCompanyPageUrl(
                     company.universityName,
                     InteractionSources.Live_Stream_Details
                  )}
                  sx={{ color: "white" }}
               >
                  {companyName}
               </Box>
            ) : (
               companyName
            )}
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
            width={73}
            height={73}
         />
         <Box sx={styles.companyNameWrapper}>
            <Typography fontWeight={300} variant={"body1"}>
               <Skeleton width={70} />
            </Typography>
            <Typography fontWeight={600} variant={"brandedH4"}>
               <Skeleton width={120} />
            </Typography>
         </Box>
      </Stack>
   )
}

export default HostInfo
