import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import Box from "@mui/material/Box"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
import Typography from "@mui/material/Typography"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import RoundedLogo from "components/views/common/RoundedLogo"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "row",
   },
   displayName: {
      fontSize: "1.14286rem",
      fontWeight: 500,
      lineHeight: "117.5%",
      letterSpacing: "-0.03121rem",
      ...getMaxLineStyles(1),
   },
   companyName: {
      fontSize: "0.85714rem",
      fontStyle: "normal",
      fontWeight: 300,
      lineHeight: "117.5%",
      letterSpacing: "-0.03121rem",
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
}

const SparkDetails: FC<Props> = ({
   companyName,
   displayName,
   companyLogoUrl,
}) => {
   return (
      <Box sx={styles.root}>
         <RoundedLogo
            src={companyLogoUrl}
            alt={companyName}
            size={36}
            borderRadius={1.5}
         />
         <Box mr={0.75} />
         <Box sx={styles.creatorDetails}>
            <BrandedTooltip title={displayName.length > 20 ? displayName : ""}>
               <Typography sx={styles.displayName} component={"h5"}>
                  {displayName}
               </Typography>
            </BrandedTooltip>
            <BrandedTooltip title={companyName.length > 20 ? companyName : ""}>
               <Typography sx={styles.companyName}>
                  From {companyName}
               </Typography>
            </BrandedTooltip>
         </Box>
      </Box>
   )
}

export default SparkDetails
