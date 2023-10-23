import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import Box from "@mui/material/Box"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
import Typography from "@mui/material/Typography"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import RoundedLogo from "components/views/common/RoundedLogo"
import Link from "components/views/common/Link"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "row",
      textDecoration: "none",
      color: "inherit",
   },
   displayName: {
      fontSize: "1.14286rem",
      fontWeight: 500,
      lineHeight: "117.5%",
      letterSpacing: "-0.03121rem",
      ...getMaxLineStyles(1),
   },
   displayNameWithRole: {
      fontWeight: 600,
      lineHeight: "168.75%",
   },
   companyName: {
      fontSize: "0.85714rem",
      fontWeight: 300,
      lineHeight: "117.5%",
      ...getMaxLineStyles(1),
   },
   creatorDetails: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   companyNameAndRole: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: "171.429%",
      ...getMaxLineStyles(2),
   },
})

type Props = {
   displayName: string
   companyName: string
   companyLogoUrl: string
   linkToCompanyPage?: string
   creatorPosition?: string
   onClick?: () => void
}

const SparkDetails: FC<Props> = ({
   companyName,
   displayName,
   companyLogoUrl,
   linkToCompanyPage,
   creatorPosition,
   onClick,
}) => {
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
         component={linkToCompanyPage ? Link : undefined}
         href={linkToCompanyPage}
         sx={styles.root}
         onClick={onClick}
      >
         <span>
            <RoundedLogo
               src={companyLogoUrl}
               alt={companyName}
               size={52}
               borderRadius={100}
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
                  component={"h5"}
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
                     showCreatorPosition && styles.companyNameAndRole,
                  ]}
               >
                  {details}
               </Typography>
            </BrandedTooltip>
         </Box>
      </Box>
   )
}

export default SparkDetails
