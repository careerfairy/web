import React from "react"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import clsx from "clsx"
import { Avatar, Typography } from "@mui/material"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import dayjs from "dayjs"

const useStyles = makeStyles((theme) => ({
   streamCompanyLogo: {
      width: 60,
      height: 60,
      background: theme.palette.common.white,
      boxShadow: theme.shadows[2],
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
   },
   optionViewRoot: {
      display: "flex",
      flexDirection: "column",
      padding: theme.spacing(1),
      borderBottom: `2px solid ${alpha(theme.palette.common.black, 0.5)}`,
      width: "100%",
      height: "100%",
      justifyContent: "space-between",
   },
   preview: {
      border: `2px solid ${alpha(theme.palette.common.black, 0.5)}`,
      borderRadius: theme.spacing(1),
   },
   optionDetailsWrapper: {
      display: "flex",
      flexWrap: "nowrap",
      width: "100%",
   },
   streamInfoWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: theme.spacing(0.5),
   },
   eventTitle: {
      display: "-webkit-box",
      boxOrient: "vertical",
      lineClamp: 2,
      WebkitLineClamp: 2,
      wordBreak: "break-word",
      overflow: "hidden",
   },
}))
const EventOptionPreview = ({ streamData, preview }) => {
   const classes = useStyles()
   return (
      <div
         className={clsx(classes.optionViewRoot, {
            [classes.preview]: preview,
         })}
      >
         <Typography
            className={classes.eventTitle}
            variant="subtitle1"
            gutterBottom
         >
            {streamData?.title}
         </Typography>
         <div className={classes.optionDetailsWrapper}>
            <Avatar
               variant="square"
               className={clsx(classes.streamCompanyLogo)}
               alt={streamData?.companyLogoUrl}
               src={getResizedUrl(streamData?.companyLogoUrl, "xs")}
            />
            <div className={classes.streamInfoWrapper}>
               <Typography variant="body2" gutterBottom color="textSecondary">
                  {dayjs(streamData?.start?.toDate?.()).format("YYYY MMM, DD")}
               </Typography>
               <Typography variant="body1">{streamData?.company}</Typography>
            </div>
         </div>
      </div>
   )
}

export default EventOptionPreview
