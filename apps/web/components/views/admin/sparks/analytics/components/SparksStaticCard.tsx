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
import useSparkStats from "components/custom-hook/spark/useSparkStats"
import CircularLogo from "components/views/common/logos/CircularLogo"
import ShareIcon from "components/views/common/icons/ShareIcon"
import ImpressionsIcon from "components/views/common/icons/ImpressionsIcon"
import TotalPlaysIcon from "components/views/common/icons/TotalPlaysIcon"
import LikeIcon from "components/views/common/icons/LikeIcon"

const styles = sxStyles({
   cardDetails: {
      cursor: "pointer",
      justifyContent: "flex-end",
      gap: "6px",
   },
   card: {
      width: ["100%", "100%", 281],
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
      height: { xs: 476, sm: 406 },
      objectFit: "cover",
   },
   cardMediaBox: {
      position: "absolute",
      bottom: "6px",
      left: "12px",
      color: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
   },
   cardMediaTypography: {
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
   statContainerBox: {
      "& svg": {
         width: "12px",
         paddingTop: "3px",
         "& path": {
            fill: "#6B6B7F",
         },
      },
   },
   statContainerBoxValue: {
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "24px",
      letterSpacing: "0em",
      textAlign: "left",
   },
})

type StatContainerProps = {
   icon: ReactElement
   value: string
}

const StatContainer: FC<StatContainerProps> = ({ icon, value }) => {
   return (
      <Stack
         direction="row"
         justifyContent="center"
         spacing={1}
         sx={styles.statContainer}
      >
         <Box sx={styles.statContainerBox}>{icon}</Box>
         <Box sx={styles.statContainerBoxValue}>{value}</Box>
      </Stack>
   )
}

type SparksStaticCardProps = {
   spark: any // TODO: to change later
}

const SparksStaticCard: FC<SparksStaticCardProps> = ({ spark }) => {
   // TODO: create something similar to useSparks() but for one spark only based on spark's id
   const { data: sparkStats } = useSparkStats(spark.id)

   const impressions = sparkStats?.impressions.toString() || "0"
   const likes = sparkStats?.likes.toString() || "0"
   const shareCTA = sparkStats?.shareCTA.toString() || "0"
   const numberOfCareerPageClicks =
      sparkStats?.numberOfCareerPageClicks.toString() || "0"

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
            title={`${spark.creator.firstName.split(" ")[0]} ${
               spark.creator.lastName
            }`} // Only use the first name in firstName if user has two names
            subheader={`From ${spark.group.universityName}`}
            sx={styles.cardHeader}
         />
         <Box sx={{ position: "relative" }}>
            <CardMedia
               component="img"
               sx={styles.cardMedia}
               image={spark.video.thumbnailUrl}
               alt="Spark's thumbnail"
            />
            <Box sx={styles.cardMediaBox}>
               <SparkCategoryChip categoryId={spark.category.id} />
               <Typography sx={styles.cardMediaTypography}>
                  {spark.question}
               </Typography>
            </Box>
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
