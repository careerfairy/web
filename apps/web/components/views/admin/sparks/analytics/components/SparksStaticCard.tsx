import { FC, ReactElement } from "react"
import {
   Box,
   Card,
   CardActions,
   CardHeader,
   CardMedia,
   IconButton,
   Stack,
   Typography,
} from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { Spark, SparkCategory } from "@careerfairy/shared-lib/sparks/sparks"
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
})

export const SparksStaticCard = () => {
   const spark = {
      id: "GtAz8lKg9POi9TVrJSxs",
      category: { id: "company-culture" as SparkCategory["id"] },
      question: "What's one great benefit of working at ABB?",
      video: {
         thumbnailUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/sparks%2Fthumbnails%2Fec15e7ae-a46a-4dc5-8681-09fff96d0227.jpeg?alt=media&token=2e4a781f-65ae-4720-af50-4fe9f05c6eb4",
      },
      group: { universityName: "ABB" },
      creator: {
         firstName: "Antonia Maria",
         lastName: "Mauch",
         avatarUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/groups%2FlgHmyR0XipDBcYm0UPtH%2Fcreator-avatars%2F567fb7db-4497-486d-8317-0ae399ad2df2.png?alt=media&token=42ae5f6c-6b03-4a49-942c-7fde52584a87",
      },
   }
   // useSparks() TODO: create something similar but for one spark only
   const { data: sparkStats } = useSparkStats(spark.id)

   const impressions = sparkStats?.impressions.toString() || "0"
   const likes = sparkStats?.likes.toString() || "0"
   const shareCTA = sparkStats?.shareCTA.toString() || "0"
   const numberOfCareerPageClicks =
      sparkStats?.numberOfCareerPageClicks.toString() || "0"

   return (
      <Card
         variant="outlined"
         sx={{
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
         }}
      >
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
            }`}
            subheader={`From ${spark.group.universityName}`}
            sx={{
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
            }}
         />
         <Box sx={{ position: "relative" }}>
            <CardMedia
               component="img"
               sx={{
                  height: { xs: 476, sm: 406 },
                  objectFit: "cover",
               }}
               image={spark.video.thumbnailUrl}
               alt="Paella dish"
            />
            <Box
               sx={{
                  position: "absolute",
                  bottom: "6px",
                  left: "12px",
                  color: "#FFFFFF",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
               }}
            >
               <SparkCategoryChip categoryId={spark.category.id} />
               <Typography
                  sx={{
                     fontsize: "16px",
                     fontweight: "400",
                     letterspacing: "0em",
                     paddingRight: "10%",
                  }}
               >
                  {spark.question}
               </Typography>
            </Box>
         </Box>
         <CardActions
            sx={{
               justifyContent: "space-between",
               padding: "14px 16px 14px 16px",
            }}
         >
            <StatContainer
               icon={
                  <ImpressionsIcon
                     sx={{
                        width: "14px !important",
                        paddingTop: "30% !important",
                     }}
                  />
               }
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
         sx={{
            fontWeight: "400",
            letterSpacing: "0em",
            color: "#6B6B7F",
         }}
      >
         <Box
            sx={{
               "& svg": {
                  width: "12px",
                  paddingTop: "3px",
                  "& path": {
                     fill: "#6B6B7F",
                  },
               },
            }}
         >
            {icon}
         </Box>
         <Box
            sx={{
               fontSize: "14px",
               fontWeight: "400",
               lineHeight: "24px",
               letterSpacing: "0em",
               textAlign: "left",
            }}
         >
            {value}
         </Box>
      </Stack>
   )
}

export default SparksStaticCard
