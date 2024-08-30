import { CompetitorSparkData } from "@careerfairy/shared-lib/sparks/analytics"
import {
   Box,
   Card,
   CardActions,
   CardHeader,
   CardMedia,
   Stack,
   Typography,
} from "@mui/material"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import ClockIcon from "components/views/common/icons/ClockIcon"
import EngagementIcon from "components/views/common/icons/EngagementIcon"
import ImpressionsIcon from "components/views/common/icons/ImpressionsIcon"
import CircularLogo from "components/views/common/logos/CircularLogo"
import SparkCategoryChip from "components/views/sparks/components/spark-card/SparkCategoryChip"
import { useGroup } from "layouts/GroupDashboardLayout"
import { ReactElement } from "react"
import { sxStyles } from "types/commonTypes"
import useSpark from "./useSpark"

const styles = sxStyles({
   card: (theme) => ({
      width: {
         xs: "100%",
         md: 281,
      },
      height: {
         xs: "154vw",
         md: "initial",
      },
      boxShadow: "none",
      borderRadius: "12px",
      border: `1px solid ${theme.brand.white["500"]}`,
      background: `linear-gradient(0deg, ${theme.brand.white["300"]}, ${theme.brand.white["300"]}), linear-gradient(0deg, ${theme.brand.white["500"]}, ${theme.brand.white["500"]})`,
      "& .MuiCardHeader-root": {
         display: "flex",
         alignItems: "center",
      },
   }),
   cardHeader: {
      height: "62px",
      padding: "10px 12px 10px 12px",
      "& .MuiCardHeader-avatar": {
         marginRight: "6px",
      },
      "& .MuiCardHeader-content": {
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
      },
      "& .MuiCardHeader-title": {
         fontSize: "16px",
         fontWeight: 600,
         letterSpacing: "0em",
         lineHeight: "17px",
      },
      "& .MuiCardHeader-subheader": {
         fontSize: "12px",
         fontWeight: "400",
         letterSpacing: "0em",
         textAlign: "left",
         lineHeight: "17px",
      },
   },
   cardMedia: {
      height: {
         xs: "calc(154vw - 62px - 55px)",
         md: 406,
      },
      objectFit: "cover",
   },
   sparksTypeAndTitle: (theme) => ({
      position: "absolute",
      bottom: "6px",
      left: "12px",
      color: theme.brand.white["50"],
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      zIndex: 2,
   }),
   cardMediaGradientOverlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      background: `
      linear-gradient(180deg, rgba(0, 0, 0, 0) 78.12%, rgba(0, 0, 0, 0.6) 100%),linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 17.71%)
      `,
      zIndex: 1,
   },
   sparksTitle: {
      fontsize: "16px",
      fontweight: "400",
      letterspacing: "0em",
      paddingRight: "10%",
   },
   cardActions: {
      justifyContent: "space-between",
      padding: "14px 16px 14px 16px",
   },
   impressionsIcon: {
      width: "14px !important",
      paddingTop: "30% !important",
   },
   statContainer: (theme) => ({
      fontWeight: "400",
      letterSpacing: "0em",
      color: theme.palette.neutral["600"],
   }),
   statIcon: (theme) => ({
      "& svg": {
         width: "12px",
         paddingTop: "3px",
         "& path": {
            fill: theme.palette.neutral["600"],
         },
      },
   }),
   statValue: {
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "24px",
      letterSpacing: "0em",
      textAlign: "left",
   },
   cardWithBorder: {
      border: (theme) => `2px solid ${theme.palette.primary["500"]}`,
   },
})

type StatContainerProps = {
   icon: ReactElement
   value: string | number
}

const StatContainer = ({ icon, value }: StatContainerProps) => {
   return (
      <Stack
         direction="row"
         justifyContent="center"
         spacing={1}
         sx={styles.statContainer}
      >
         <Box sx={styles.statIcon}>{icon}</Box>
         <Box sx={styles.statValue}>{value}</Box>
      </Stack>
   )
}

export const StaticSparkCard = ({
   sparkId,
   plays,
   avgWatchedTime,
   engagement,
}: CompetitorSparkData) => {
   const { group } = useGroup()
   const spark = useSpark(sparkId)

   const isSparkFromGroup = spark?.group.id === group?.groupId

   if (!spark) return null

   return (
      <Card
         variant="outlined"
         sx={[styles.card, isSparkFromGroup && styles.cardWithBorder]}
      >
         <CardHeader
            avatar={
               <CircularLogo
                  src={spark?.creator.avatarUrl}
                  alt={"Creator's Avatar"}
                  objectFit="cover"
                  size={46}
               />
            }
            // Only use the first name in firstName if user has two names
            title={`${spark.creator?.firstName.split(" ")[0]} ${
               spark.creator.lastName
            }`}
            subheader={`From ${
               spark.group.universityName.length > 30
                  ? spark.group.universityName.substring(0, 25) + "..."
                  : spark.group.universityName
            }`}
            sx={styles.cardHeader}
         />
         <Box sx={{ position: "relative" }}>
            <Box sx={styles.sparksTypeAndTitle}>
               <SparkCategoryChip categoryId={spark.category.id} />
               <Typography sx={styles.sparksTitle}>{spark.question}</Typography>
            </Box>
            <Box sx={styles.cardMediaGradientOverlay} />
            <CardMedia
               component="img"
               sx={styles.cardMedia}
               image={getResizedUrl(spark.video.thumbnailUrl, "md")}
               alt="Spark's thumbnail"
            />
         </Box>
         <CardActions sx={styles.cardActions}>
            <StatContainer
               icon={<ImpressionsIcon sx={styles.impressionsIcon} />}
               value={plays}
            />
            <StatContainer
               icon={<ClockIcon />}
               value={Math.ceil(avgWatchedTime) + "s"}
            />
            <StatContainer
               icon={<EngagementIcon />}
               value={Math.ceil(engagement)}
            />
         </CardActions>
      </Card>
   )
}
