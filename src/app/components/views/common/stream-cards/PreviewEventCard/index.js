import React, { useState } from "react";
import makeStyles from '@mui/styles/makeStyles';
import clsx from "clsx";
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions";
import { Avatar, Grid, Typography } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import DateUtil from "../../../../../util/DateUtil";
import ClockIcon from "@mui/icons-material/AccessTime";

const useStyles = makeStyles((theme) => {
   const radiusValue = 5;
   const cardBorderRadius = theme.spacing(radiusValue);
   const logoTopHeight = 120;
   return {
      card: {
         position: "relative",
         display: "block",
         height: "100%",
         borderRadius: cardBorderRadius,
         overflow: "hidden",
         textDecoration: "none",
      },
      cardImage: {
         width: "100%",
         height: "100%",
         objectFit: "cover",
         overflow: "hidden",
         transition: theme.transitions.create(["transform"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
      },
      zoomIn: {
         transform: "scale(1.25)",
      },
      cardOverlay: {
         position: "absolute",
         bottom: "0",
         left: "0",
         right: "0",
         zIndex: 1,
         borderRadius: cardBorderRadius,
         boxShadow: theme.shadows[2],
         backgroundColor: theme.palette.background.paper,
         transform: "translateY(100%)",
         transition: theme.transitions.create(["transform"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
      },
      slideUp: { transform: "translateY(0) !important" },
      cardHeader: {
         position: "relative",
         // display: "flex",
         paddingTop: logoTopHeight / 2,
         transform: "translateY(-100%)",
         alignItems: "center",
         padding: "2em",
         borderRadius: theme.spacing(radiusValue, 0, 0, 0),
         backgroundColor: theme.palette.background.paper,
         transition: theme.transitions.create(["transform"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
      },
      cardHeaderTop: {
         display: "flex",
         width: "100%",
      },
      cardArc: {
         width: "80px",
         height: "80px",
         position: "absolute",
         bottom: "100%",
         right: "0",
         zIndex: 1,
         "& path": {
            fill: theme.palette.background.paper,
            d: 'path("M 40 80 c 22 0 40 -22 40 -40 v 40 Z")',
            filter: `drop-shadow(0px 0px 2px rgba(0,0,0,0.4))`,
         },
      },
      left: {
         right: "auto",
         left: 0,
         transform: "rotate(90deg)",
         "& path": {},
      },
      cardThumb: {
         flexShrink: 0,
         width: "50px",
         height: "50px",
         boxShadow: theme.shadows[2],
         padding: theme.spacing(1),
         borderRadius: cardBorderRadius,
         "& img": {
            objectFit: "contain",
         },
      },
      cardLogoTop: {
         zIndex: 1,
         left: 0,
         right: 0,
         marginLeft: "auto",
         marginRight: "auto",
         width: logoTopHeight,
         height: logoTopHeight,
         top: (logoTopHeight / 2) * -1,
         background: theme.palette.common.white,
         boxShadow: theme.shadows[2],
         padding: theme.spacing(2),
         position: "absolute",
         borderRadius: cardBorderRadius,
         "& img": {
            // borderRadius: cardBorderRadius / 2,
            objectFit: "contain",
         },
      },
      cardTitle: { fontSize: "1em", margin: "0 0 .3em", color: "#6A515E" },
      cardTagline: {
         display: "block",
         margin: "1em 0",
         fontSize: ".8em",
         color: "#D7BDCA",
      },
      eventTitle: {
         fontWeight: 550,
         margin: 0,
         display: "-webkit-box",
         boxOrient: "vertical",
         lineClamp: 3,
         WebkitLineClamp: 3,
         wordBreak: "break-word",
         overflow: "hidden",
      },
      dateInfo: {
         overflow: "hidden",
         textOverflow: "ellipsis",
         color: theme.palette.text.secondary,
         alignItems: "center",
         display: "flex",
         boxOrient: "vertical",
         lineClamp: 1,
         WebkitLineClamp: 1,
      },
      cardStatus: { fontSize: ".8em", color: "#D7BDCA" },
      cardDescription: {
         padding: "0 2em 2em",
         margin: "0",
         color: "#D7BDCA",
         display: "-webkit-box",
         WebkitBoxOrient: "vertical",
         WebkitLineClamp: "3",
         overflow: "hidden",
      },
   };
});
const PreviewEventCard = ({ livestream }) => {
   const classes = useStyles();
   const [hovered, setHovered] = useState(false);
   const handleMouseEnter = () => setHovered(true);
   const handleMouseLeave = () => setHovered(false);
   return (
      <div
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         onfocusin={handleMouseEnter}
         onfocusout={handleMouseLeave}
         className={clsx(classes.card, hovered && classes.slideUp)}
      >
         <img
            src={getResizedUrl(livestream.backgroundImageUrl, "md")}
            className={clsx(classes.cardImage, hovered && classes.zoomIn)}
            alt={`thumbnail`}
         />
         <div className={clsx(classes.cardOverlay, hovered && classes.slideUp)}>
            <div
               className={clsx(classes.cardHeader, hovered && classes.slideUp)}
            >
               <Grid container spacing={1}>
                  <Avatar
                     className={classes.cardLogoTop}
                     variant="rounded"
                     src={getResizedUrl(livestream.companyLogoUrl, "md")}
                     alt={`${livestream.company}-logo`}
                  />
                  <svg
                     className={classes.cardArc}
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <path />
                  </svg>
                  <svg
                     className={clsx(classes.cardArc, classes.left)}
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <path />
                  </svg>
                  <Grid item xs={12}>
                     <h3 className={classes.cardTitle}>{livestream.company}</h3>
                     <Typography
                        variant="h5"
                        gutterBottom
                        className={classes.eventTitle}
                     >
                        {livestream.title}
                     </Typography>
                  </Grid>
                  <Grid item xs={12}>
                     <Typography
                        gutterBottom
                        className={classes.dateInfo}
                        variant="h6"
                     >
                        <EventIcon />
                        &nbsp;
                        {DateUtil.getStreamDate(livestream.start.toDate())}
                     </Typography>
                     <Typography
                        gutterBottom
                        className={classes.dateInfo}
                        variant="h6"
                     >
                        <ClockIcon />
                        &nbsp;
                        {DateUtil.getStreamTime(livestream.start.toDate())}
                     </Typography>
                  </Grid>
               </Grid>
            </div>
            <p className={classes.cardDescription}>
               Lorem ipsum dolor sit amet consectetur adipisicing elit.
               Asperiores, blanditiis?
            </p>
         </div>
      </div>
   );
};

export default PreviewEventCard;
