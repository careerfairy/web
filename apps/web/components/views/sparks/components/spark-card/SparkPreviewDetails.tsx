import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
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
   companyName: {
      fontWeight: 400,
      ...getMaxLineStyles(1),
   },
   creatorDetails: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
})

type Props = {
   displayName: string
   companyName: string
   companyLogoUrl: string
   onClick?: () => void
   small?: boolean
}

const SparkPreviewDetails = ({
   companyName,
   displayName,
   companyLogoUrl,
   onClick,
   small = false,
}: Props) => {
   return (
      <Box sx={styles.root} onClick={onClick}>
         <span>
            <CircularLogo
               src={companyLogoUrl}
               alt={companyName}
               size={small ? 28 : 40}
               objectFit="cover"
            />
         </span>
         <Box mr={0.5} />
         <Box sx={styles.creatorDetails}>
            <BrandedTooltip title={displayName.length > 40 ? displayName : ""}>
               <Typography
                  sx={[styles.displayName]}
                  variant={small ? "xsmall" : "small"}
               >
                  {displayName}
               </Typography>
            </BrandedTooltip>

            <Typography sx={styles.companyName} variant={"xsmall"}>
               From {companyName}
            </Typography>
         </Box>
      </Box>
   )
}

export default SparkPreviewDetails
