import React, { FC } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { sxStyles } from "../../../../../../../types/commonTypes"
import {
   Card,
   CardActionArea,
   CardContent,
   Rating,
   Tooltip,
   Typography,
} from "@mui/material"
import CardMedia from "@mui/material/CardMedia"
import Image from "next/legacy/image"
import {
   getMaxLineStyles,
   getResizedUrl,
} from "../../../../../../helperFunctions/HelperFunctions"
import DateUtil from "../../../../../../../util/DateUtil"
import {
   getGlobalRatingAverage,
   getTotalNumberOfRatings,
} from "@careerfairy/shared-lib/livestreams/ratings"
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded"
import Stack from "@mui/material/Stack"
import { company_building } from "../../../../../../../constants/images"
import Link from "next/link"
import Skeleton from "@mui/material/Skeleton"

const MEDIA_HEIGHT = 90
const styles = sxStyles({
   root: {},
   actionArea: {
      "& .illustration": {
         transition: (theme) => theme.transitions.create("transform"),
      },
      "&:hover, &:focus": {
         "& .illustration": {
            transform: "scale(1.1)",
         },
      },
   },
   media: {
      height: MEDIA_HEIGHT,
      position: "relative",
   },
   stars: {
      color: "secondary.main",
   },
   loadingStars: {
      color: (theme) => theme.palette.grey["400"],
   },
   title: {
      ...getMaxLineStyles(2),
      fontSize: "1.07rem",
      fontWeight: 600,
      height: "3.2rem",
   },
   time: {
      ...getMaxLineStyles(1),
      fontSize: "0.93rem",
   },
   numberOfReviews: {
      color: "secondary.main",
      mt: "4px !important",
   },
})

type Props = {
   stats: LiveStreamStats
   groupId: string
}
const FeedbackCard: FC<Props> = ({ stats, groupId }) => {
   return (
      <Card sx={styles.root}>
         <Link
            href={`/group/${groupId}/admin/analytics/feedback/${stats.livestream.id}`}
            passHref
         >
            <CardActionArea sx={styles.actionArea} component="a">
               <CardMedia sx={styles.media} title={stats.livestream.company}>
                  <Image
                     src={getResizedUrl(
                        stats.livestream.backgroundImageUrl || company_building,
                        "md"
                     )}
                     className="illustration"
                     layout="fill"
                     alt={stats.livestream.company}
                     objectFit="cover"
                  />
               </CardMedia>
               <CardContent>
                  <Stack spacing={1}>
                     <Typography sx={styles.time} color="text.secondary">
                        {DateUtil.dateWithYear(stats.livestream.start.toDate())}
                     </Typography>
                     <Tooltip
                        enterDelay={500}
                        placement="right-end"
                        arrow
                        title={
                           stats.livestream.title.length > 85
                              ? stats.livestream.title
                              : ""
                        }
                     >
                        <Typography sx={styles.title} whiteSpace="pre-line">
                           {stats.livestream.title}
                        </Typography>
                     </Tooltip>
                     <Stack alignItems="center" direction={"row"} spacing={1}>
                        <Rating
                           name="read-only"
                           value={getGlobalRatingAverage(stats)}
                           precision={0.5}
                           sx={styles.stars}
                           icon={<StarRateRoundedIcon />}
                           emptyIcon={<StarRateRoundedIcon />}
                           readOnly
                        />
                        <Typography sx={styles.numberOfReviews}>
                           {getTotalNumberOfRatings(stats)} reviews
                        </Typography>
                     </Stack>
                  </Stack>
               </CardContent>
            </CardActionArea>
         </Link>
      </Card>
   )
}

export const FeedbackCardSkeleton: FC = () => {
   return (
      <Card sx={styles.root}>
         <Skeleton sx={styles.media} animation="wave" variant="rectangular" />
         <CardContent>
            <Stack spacing={1}>
               <Typography sx={styles.time}>
                  <Skeleton width={"40%"} />
               </Typography>
               <Typography sx={styles.title}>
                  <Skeleton />
                  <Skeleton width="60%" />
               </Typography>
               <Stack alignItems="center" direction={"row"} spacing={1}>
                  <Rating
                     name="read-only"
                     value={5}
                     precision={0.5}
                     sx={styles.loadingStars}
                     icon={<StarRateRoundedIcon />}
                     emptyIcon={<StarRateRoundedIcon />}
                     readOnly
                  />
                  <Typography>
                     <Skeleton width={50} />
                  </Typography>
               </Stack>
            </Stack>
         </CardContent>
      </Card>
   )
}

export default FeedbackCard
