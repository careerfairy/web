import React from "react";
import { Box, darken, IconButton, Typography } from "@mui/material";
import DateAndShareDisplay from "./common/DateAndShareDisplay";
import { LiveStreamEvent } from "types/event";
import Stack from "@mui/material/Stack";
import CardMedia from "@mui/material/CardMedia";
import Skeleton from "@mui/material/Skeleton";
import Image from "next/image";
import {
   getMaxLineStyles,
   getResizedUrl,
} from "../../../helperFunctions/HelperFunctions";
import { ChevronRight } from "@mui/icons-material";
import Link from "next/link";

const styles = {
   details: {
      backgroundColor: (theme) => darken(theme.palette.background.default, 0.1),
      borderRadius: 2,
      boxShadow: 1,
      "& svg": {
         color: "text.secondary",
      },
   },
   eventName: {
      ...getMaxLineStyles(2),
      fontWeight: 600,
      color: "text.secondary",
   },
   logo: {
      width: 60,
      minWidth: 60,
      height: 40,
      p: 0.5,
      m: 1,
      display: "grid",
      placeItems: "center",
      backgroundColor: (theme) => theme.palette.common.white,
      borderRadius: 2,
      boxShadow: 1,
   },
} as const;

const EventNameCard = ({ event, loading }: Props) => {
   const getStartDate = () => event?.start?.toDate?.();

   return (
      <Link href={`/upcoming-livestream/${event?.id}`}>
         <a>
            <DateAndShareDisplay startDate={getStartDate()} loading={loading} />
            <Stack
               justifyContent={"space-between"}
               alignItems={"center"}
               direction={"row"}
               spacing={1}
               sx={styles.details}
            >
               <CardMedia sx={styles.logo} title={event?.company}>
                  {loading ? (
                     <Skeleton
                        animation="wave"
                        variant="rectangular"
                        sx={{ borderRadius: 2 }}
                        width={180}
                        height={60}
                     />
                  ) : (
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
                  )}
               </CardMedia>
               <Typography sx={styles.eventName}>
                  {loading ? (
                     <Skeleton />
                  ) : (
                     event?.title + event?.title + event?.title
                  )}
               </Typography>
               <ChevronRight fontSize={"large"} />
            </Stack>
         </a>
      </Link>
   );
};
interface Props {
   event?: LiveStreamEvent;
   loading?: boolean;
}

export default EventNameCard;
