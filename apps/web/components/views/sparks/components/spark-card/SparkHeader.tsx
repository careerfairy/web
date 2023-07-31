import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import RoundedLogo from "components/views/common/RoundedLogo"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
import { DateTime } from "luxon"
import { FC, Fragment } from "react"
import { sxStyles } from "types/commonTypes"
import SparkOptionsButton from "./SparkOptionsButton"

const styles = sxStyles({
   root: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
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
   newTag: {
      px: 1.5,
      py: 0.3,
      fontSize: "0.85714rem",
      fontWeight: 500,
      lineHeight: "117.5%",
      letterSpacing: "-0.03121rem",
      bgcolor: "primary.600",
      borderRadius: 0.5,
      mb: "auto",
   },
})

type Props = {
   spark: Spark
   showAdminOptions?: boolean
}

const SparkHeader: FC<Props> = ({ spark, showAdminOptions }) => {
   return (
      <Fragment>
         <Box sx={styles.root}>
            <RoundedLogo
               src={spark.group.logoUrl}
               alt={spark.group.universityName}
               size={36}
               borderRadius={1.5}
            />
            <Box mr={0.75} />
            <SparkCreatorDetails
               displayName={`${spark.creator.firstName} ${spark.creator.lastName}`}
               companyName={spark.group.universityName}
            />
            <Box mr={1.25} />
            <NewTag sparkCreatedDate={spark.createdAt.toDate()} />
            {showAdminOptions ? (
               <Fragment>
                  <Box width={20} />
                  <SparkOptionsButton
                     groupId={spark.group.id}
                     sparkId={spark.id}
                  />
               </Fragment>
            ) : null}
         </Box>
      </Fragment>
   )
}

type SparkCreatorDetailsProps = {
   displayName: string
   companyName: string
}

const SparkCreatorDetails: FC<SparkCreatorDetailsProps> = ({
   companyName,
   displayName,
}) => {
   return (
      <Box>
         <BrandedTooltip title={displayName.length > 20 ? displayName : ""}>
            <Typography sx={styles.displayName} component={"h5"}>
               {displayName}
            </Typography>
         </BrandedTooltip>
         <BrandedTooltip title={companyName.length > 20 ? companyName : ""}>
            <Typography sx={styles.companyName}>From {companyName}</Typography>
         </BrandedTooltip>
      </Box>
   )
}

type NewTagProps = {
   sparkCreatedDate: Date
}

const oneDayAgo = DateTime.now().minus({ days: 1 }).toJSDate()

const NewTag: FC<NewTagProps> = ({ sparkCreatedDate }) => {
   // only show new tag if spark was created within the last 1 day
   if (sparkCreatedDate < oneDayAgo) {
      return null
   }

   return <Typography sx={styles.newTag}>New</Typography>
}

export default SparkHeader
