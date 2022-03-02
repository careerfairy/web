import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ShareIcon from "@mui/icons-material/Share";
import { LiveStreamEvent } from "../../../../tempTypes/event";
import DateUtil from "../../../../util/DateUtil";
import { IconButton } from "@mui/material";
const styles = {
   root: {},
   dateShareWrapper: {
      p: 1,
   },
   date: {
      fontWeight: 600,
   },
   mainContentWrapper: {
      position: "relative",
      height: (theme) => theme.spacing(20),
      display: "flex",
      alignItems: "flex-end",
      overflow: "hidden",
      padding: "1rem",
      width: "100%",
      textAlign: "center",
      color: "whitesmoke",
      backgroundColor: "whitesmoke",
      boxShadow: 5,
      backgroundSize: "cover",
      "&:hover:after": {
         transform: "translateY(0)",
      },
      "&:hover, &:focus-within": {
         alignItems: "center",
         "&:before": { transform: "translateY(-4%)" },
         "&:after": { transform: "translateY(-50%)" },
         ".content": {
            transform: "translateY(0)",
            "& > *:not(.title)": {
               opacity: 1,
               transform: "translateY(0)",
               transitionDelay: "calc(700ms / 8)",
            },
         },
      },
      "&:hover": {
         ".card:focus-within": {
            "&:before, &:after, .mainContent, .mainContent > *:not(.title)": {
               transitionDuration: "0s",
            },
         },
         "& .mainContent": {
            transform: "translateY(calc(100% - 4.5rem))",
            "> *:not(.title)": {
               opacity: 0,
               transform: "translateY(1rem)",
               transition:
                  "transform 700ms cubic-bezier(0.19, 1, 0.22, 1), opacity 700ms cubic-bezier(0.19, 1, 0.22, 1)",
            },
         },
      },
      "&:before": {
         content: "''",
         position: "absolute",
         top: "0",
         left: "0",
         width: "100%",
         height: "110%",
         backgroundSize: "cover",
         backgroundPosition: "0 0",
         transition:
            "transform calc(700ms * 1.5) cubic-bezier(0.19, 1, 0.22, 1)",
         pointerEvents: "none",
      },
      "&:after": {
         content: "''",
         display: "block",
         position: "absolute",
         top: "0",
         left: "0",
         width: "100%",
         height: "200%",
         pointerEvents: "none",
         backgroundImage:
            "linear-gradient(to bottom,hsla(0, 0%, 0%, 0) 0%, hsla(0, 0%, 0%, 0.009) 11.7%, hsla(0, 0%, 0%, 0.034) 22.1%, hsla(0, 0%, 0%, 0.072) 31.2%, hsla(0, 0%, 0%, 0.123) 39.4%, hsla(0, 0%, 0%, 0.182) 46.6%, hsla(0, 0%, 0%, 0.249) 53.1%, hsla(0, 0%, 0%, 0.320) 58.9%, hsla(0, 0%, 0%, 0.394) 64.3%, hsla(0, 0%, 0%, 0.468) 69.3%, hsla(0, 0%, 0%, 0.540) 74.1%, hsla(0, 0%, 0%, 0.607) 78.8%, hsla(0, 0%, 0%, 0.668) 83.6%, hsla(0, 0%, 0%, 0.721) 88.7%, hsla(0, 0%, 0%, 0.762) 94.1%, hsla(0, 0%, 0%, 0.790) 100%)",
         transform: "translateY(-50%)",
         transition: "transform calc(700ms * 2) cubic-bezier(0.19, 1, 0.22, 1)",
      },
   },
   mainContent: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      padding: "1rem",
      transition: "transform 700ms cubic-bezier(0.19, 1, 0.22, 1)",
      zIndex: 1,
      "> * + *": { marginTop: "1rem" },
   },
   title: {
      fontWeight: 600,
   },
   summary: {},
} as const;
const EventPreviewCard = ({ event }: EventPreviewCardProps) => {
   console.log("-> event.backgroundImageUrl", event.backgroundImageUrl);
   return (
      <Box sx={styles.root}>
         <Stack
            spacing={2}
            sx={styles.dateShareWrapper}
            justifyContent="space-between"
            alignItems={"center"}
            direction="row"
         >
            <Typography variant={"subtitle1"} sx={styles.date}>
               {DateUtil.eventPreviewDate(event.startDate)}
            </Typography>
            <IconButton>
               <ShareIcon fontSize={"large"} />
            </IconButton>
         </Stack>
         <Box
            sx={[
               styles.mainContentWrapper,
               { backgroundImage: `url(${event.backgroundImageUrl})` },
            ]}
         >
            <Box className="mainContent" sx={styles.mainContent}>
               <Typography className="title" sx={styles.title}>
                  {event.title}
               </Typography>
               <Typography sx={styles.summary}>{event.summary}</Typography>
            </Box>
         </Box>
      </Box>
   );
};

interface EventPreviewCardProps {
   event: LiveStreamEvent;
}
export default EventPreviewCard;
