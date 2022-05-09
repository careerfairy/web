import React from "react"
import { Typography } from "@mui/material"
import DateAndShareDisplay from "./common/DateAndShareDisplay"
import { LiveStreamEvent } from "types/event"
import Stack from "@mui/material/Stack"
import CardMedia from "@mui/material/CardMedia"
import Skeleton from "@mui/material/Skeleton"
import Image from "next/image"
import {
   getMaxLineStyles,
   getResizedUrl,
} from "../../../helperFunctions/HelperFunctions"
import ChevronRight from "@mui/icons-material/ChevronRight"
import Link from "next/link"
import { alpha, Theme } from "@mui/material/styles"

const radius = 1
const styles = {
   details: {
      backgroundColor: (theme: Theme) =>
         alpha(theme.palette.grey["dark"], 0.21),
      borderRadius: radius,
      "& svg": {
         color: "text.secondary",
      },
   },
   eventName: {
      ...getMaxLineStyles(2),
      fontWeight: 600,
      color: "text.secondary",
      mr: "auto !important",
      flex: 1,
      px: 2,
   },
   logo: {
      width: 70,
      minWidth: 70,
      height: 40,
      p: 0.5,
      m: 1,
      display: "grid",
      placeItems: "center",
      backgroundColor: (theme) => theme.palette.common.white,
      borderRadius: radius,
      border: (theme) => `2px solid ${theme.palette.grey["300"]}`,
   },
} as const

const EventNameCard = ({ event, loading, animation }: Props) => {
   const getStartDate = () => event?.start?.toDate?.()
   return (
      <Link href={`/upcoming-livestream/${event?.id}`}>
         <a>
            <DateAndShareDisplay
               animation={animation}
               startDate={getStartDate()}
               loading={loading}
            />
            <Stack
               justifyContent={"space-between"}
               alignItems={"center"}
               direction={"row"}
               spacing={1}
               sx={styles.details}
            >
               {loading ? (
                  <Skeleton
                     animation={animation}
                     variant="rectangular"
                     sx={styles.logo}
                  />
               ) : (
                  <CardMedia sx={styles.logo} title={event?.company}>
                     <div
                        style={{
                           position: "relative",
                           width: "100%",
                           height: "100%",
                        }}
                     >
                        <Image
                           src={getResizedUrl(event?.companyLogoUrl, "lg")}
                           layout="fill"
                           objectFit="contain"
                        />
                     </div>
                  </CardMedia>
               )}
               <Typography sx={styles.eventName}>
                  {loading ? (
                     <>
                        <Skeleton animation={animation} width={"60%"} />
                        <Skeleton animation={animation} width={"20%"} />
                     </>
                  ) : (
                     event?.title + event?.title + event?.title
                  )}
               </Typography>
               <ChevronRight fontSize={"large"} />
            </Stack>
         </a>
      </Link>
   )
}
interface Props {
   event?: LiveStreamEvent
   loading?: boolean
   // Animate the loading animation, defaults to the "wave" prop
   animation?: false | "wave" | "pulse"
}

export default EventNameCard
