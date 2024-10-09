import { CompetitorSparkData } from "@careerfairy/shared-lib/sparks/analytics"
import { CheckCircleRounded } from "@mui/icons-material"
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

const styles = sxStyles({
   card: (theme) => ({
      width: "265px",
      height: "481px",
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
      height: "56px",
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
      height: "377px",
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
      height: "48px",
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

type CompetitorSparkStaticCardProps = {
   turnOffHighlighting?: boolean
} & Omit<CompetitorSparkData, "rank">

export const CompetitorSparkStaticCard = ({
   sparkData,
   num_views,
   avg_watched_time,
   avg_watched_percentage,
   engagement,
   turnOffHighlighting = false,
}: CompetitorSparkStaticCardProps) => {
   const { group } = useGroup()

   const highlight =
      !turnOffHighlighting && sparkData?.group.id === group?.groupId

   if (!sparkData) return null

   return (
      <Card
         variant="outlined"
         sx={[styles.card, highlight && styles.cardWithBorder]}
      >
         <CardHeader
            avatar={
               <CircularLogo
                  src={sparkData?.creator?.avatarUrl}
                  alt={"Creator's Avatar"}
                  objectFit="cover"
                  size={46}
               />
            }
            // Only use the first name in firstName if user has two names
            title={`${sparkData?.creator?.firstName?.split(" ")[0]} ${
               sparkData?.creator?.lastName
            }`}
            subheader={`From ${
               sparkData?.group?.name?.length > 30
                  ? sparkData?.group?.name?.substring(0, 25) + "..."
                  : sparkData?.group?.name
            }`}
            sx={styles.cardHeader}
         />
         <Box sx={{ position: "relative" }}>
            <Box sx={styles.sparksTypeAndTitle}>
               <SparkCategoryChip categoryId={sparkData?.spark?.categoryId} />
               <Typography sx={styles.sparksTitle}>
                  {sparkData?.spark?.question}
               </Typography>
            </Box>
            <Box sx={styles.cardMediaGradientOverlay} />
            <CardMedia
               component="img"
               sx={styles.cardMedia}
               image={getResizedUrl(sparkData?.spark?.videoThumbnailUrl, "md")}
               alt="Spark's thumbnail"
            />
         </Box>
         <CardActions sx={styles.cardActions}>
            <StatContainer
               icon={<ImpressionsIcon sx={styles.impressionsIcon} />}
               value={num_views}
            />
            <StatContainer
               icon={<ClockIcon />}
               value={Math.ceil(avg_watched_time) + "s"}
            />
            <StatContainer
               icon={<CheckCircleRounded />}
               value={Math.ceil(avg_watched_percentage * 100) + "%"}
            />
            <StatContainer
               icon={<EngagementIcon />}
               value={Math.ceil(engagement)}
            />
         </CardActions>
      </Card>
   )
}
