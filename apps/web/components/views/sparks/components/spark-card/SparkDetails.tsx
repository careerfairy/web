import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import Link from "components/views/common/Link"
import CircularLogo from "components/views/common/logos/CircularLogo"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "row",
      textDecoration: "none",
      color: "inherit",
   },
   displayName: {
      fontWeight: 600,
      ...getMaxLineStyles(1),
   },
   displayNameWithRole: {
      fontWeight: 600,
   },
   companyName: {
      fontWeight: 400,
      ...getMaxLineStyles(1),
   },
   companyNameMobile: {
      mt: "-4px",
   },
   creatorDetails: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   companyNameAndRole: {
      fontWeight: 400,
      ...getMaxLineStyles(2),
   },
})

type Props = {
   displayName: string
   companyName: string
   companyLogoUrl: string
   linkToMentorPage?: string
   creatorPosition?: string
   onClick?: () => void
}

const SparkDetails: FC<Props> = ({
   companyName,
   displayName,
   companyLogoUrl,
   linkToMentorPage,
   creatorPosition,
   onClick,
}) => {
   const isFullScreen = useSparksFeedIsFullScreen()
   const showCreatorPosition = Boolean(creatorPosition)

   const detailsTooltipTitle = showCreatorPosition
      ? `${creatorPosition} at ${companyName}`
      : `From ${companyName}`

   const detailsTooltipThreshold = showCreatorPosition ? 70 : 40

   const details = showCreatorPosition ? (
      <>
         {creatorPosition} at{" "}
         <Box component="b" fontWeight={600}>
            {companyName}
         </Box>
      </>
   ) : (
      <>From {companyName}</>
   )

   return (
      <Box
         component={linkToMentorPage ? Link : undefined}
         href={linkToMentorPage}
         sx={styles.root}
         onClick={onClick}
      >
         <span>
            <CircularLogo
               src={companyLogoUrl}
               alt={companyName}
               size={isFullScreen ? 48 : 64}
               objectFit="cover"
            />
         </span>
         <Box mr={0.75} />
         <Box sx={styles.creatorDetails}>
            <BrandedTooltip title={displayName.length > 40 ? displayName : ""}>
               <Typography
                  sx={[
                     styles.displayName,
                     showCreatorPosition && styles.displayNameWithRole,
                  ]}
                  variant={isFullScreen ? "brandedBody" : "brandedH5"}
               >
                  {displayName}
               </Typography>
            </BrandedTooltip>
            <BrandedTooltip
               title={
                  detailsTooltipTitle.length > detailsTooltipThreshold
                     ? detailsTooltipTitle
                     : ""
               }
            >
               <Typography
                  sx={[
                     styles.companyName,
                     isFullScreen && styles.companyNameMobile,
                     showCreatorPosition && styles.companyNameAndRole,
                  ]}
                  variant={isFullScreen ? "xsmall" : "brandedBody"}
               >
                  {details}
               </Typography>
            </BrandedTooltip>
         </Box>
      </Box>
   )
}

export default SparkDetails
