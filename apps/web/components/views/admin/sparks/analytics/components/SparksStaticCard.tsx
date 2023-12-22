import { FC, ReactElement } from "react"
import {
   Box,
   Card,
   CardActions,
   CardHeader,
   CardMedia,
   Stack,
   Typography,
} from "@mui/material"
import { sxStyles } from "types/commonTypes"
import SparkCategoryChip from "components/views/sparks/components/spark-card/SparkCategoryChip"
import CircularLogo from "components/views/common/logos/CircularLogo"
import ShareIcon from "components/views/common/icons/ShareIcon"
import ImpressionsIcon from "components/views/common/icons/ImpressionsIcon"
import TotalPlaysIcon from "components/views/common/icons/TotalPlaysIcon"
import LikeIcon from "components/views/common/icons/LikeIcon"
import { useGroup } from "layouts/GroupDashboardLayout"
import useGroupSpark from "components/custom-hook/spark/useGroupSpark"
import useSparkStats from "components/custom-hook/spark/useSparkStats"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"

const styles = sxStyles({
   card: {
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
      border: "1px solid #F3F3F5",
      background:
         "linear-gradient(0deg, #FAFAFE, #FAFAFE), linear-gradient(0deg, #F3F3F5, #F3F3F5)",
      "& .MuiCardHeader-root": {
         display: "flex",
         alignItems: "center",
      },
   },
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
   sparksTypeAndTitle: {
      position: "absolute",
      bottom: "6px",
      left: "12px",
      color: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      zIndex: 2,
   },
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
   statContainer: {
      fontWeight: "400",
      letterSpacing: "0em",
      color: "#6B6B7F",
   },
   statIcon: {
      "& svg": {
         width: "12px",
         paddingTop: "3px",
         "& path": {
            fill: "#6B6B7F",
         },
      },
   },
   statValue: {
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "24px",
      letterSpacing: "0em",
      textAlign: "left",
   },
})

type StatContainerProps = {
   icon: ReactElement
   value: string | number
}

const StatContainer: FC<StatContainerProps> = ({ icon, value }) => {
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

type SparksStaticCardProps = {
   sparkId: string
}

const SparksStaticCard: FC<SparksStaticCardProps> = ({ sparkId }) => {
   const { group } = useGroup()
   const spark = useGroupSpark(group.id, sparkId)
   const { data: sparkStats } = useSparkStats(sparkId)

   const impressions = sparkStats?.impressions || "0"
   const likes = sparkStats?.likes || "0"
   const shareCTA = sparkStats?.shareCTA || "0"
   const numberOfCareerPageClicks = sparkStats?.numberOfCareerPageClicks || "0"

   return (
      <Card variant="outlined" sx={styles.card}>
         <CardHeader
            avatar={
               <CircularLogo
                  src={spark.creator.avatarUrl}
                  alt={"Creator's Avatar"}
                  objectFit="cover"
                  size={46}
               />
            }
            // Only use the first name in firstName if user has two names
            title={`${spark.creator.firstName.split(" ")[0]} ${
               spark.creator.lastName
            }`}
            subheader={`From ${spark.group.universityName}`}
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
               value={impressions}
            />
            <StatContainer icon={<LikeIcon />} value={likes} />
            <StatContainer icon={<ShareIcon />} value={shareCTA} />
            <StatContainer
               icon={<TotalPlaysIcon />}
               value={numberOfCareerPageClicks}
            />
         </CardActions>
      </Card>
   )
}

export default SparksStaticCard
