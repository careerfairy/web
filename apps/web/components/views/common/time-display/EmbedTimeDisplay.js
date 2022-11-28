import PropTypes from "prop-types"
import { Typography } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import React from "react"
import dayjs from "dayjs"

const useStyles = makeStyles((theme) => {
   return {
      timeWrapper: {
         paddingLeft: theme.spacing(1),
         paddingRight: theme.spacing(2),
         flex: 1,
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
         "& p": {
            color: "white !important",
         },
      },
      dateTimeWrapper: {
         position: "relative",
         zIndex: "100",
         borderRadius: "5px",
         textAlign: "center",
         fontWeight: "500",
         padding: "5px 15px",
         width: "400",
         color: theme.palette.common.white,
      },
      dateTimeWrapperMonth: {
         fontSize: `1.1rem`,
         fontWeight: 300,
         textAlign: "left",
      },
      dateTimeWrapperDay: {
         fontSize: `2.9rem`,
         fontWeight: 400,
         lineHeight: "3.1rem",
         textAlign: "left",
      },
      dateTimeWrapperHour: {
         fontWeight: 500,
         fontSize: `1.5rem`,
         textAlign: "left",
         "& span": {
            fontSize: `0.8em`,
            opacity: 0.5,
         },
      },
   }
})

const EmbedTimeDisplay = ({ date }) => {
   const classes = useStyles()

   const month = dayjs(date).format("MMM")
   const dayOfMonth = dayjs(date).format("D")

   const hour = dayjs(date).format("HH")
   const minute = dayjs(date).format("mm")

   return (
      <div className={classes.dateTimeWrapper}>
         <div>
            <Typography className={classes.dateTimeWrapperMonth}>
               {month}
            </Typography>
            <Typography className={classes.dateTimeWrapperDay}>
               {dayOfMonth}
            </Typography>
            <Typography className={classes.dateTimeWrapperHour}>
               {hour}
               <span>{minute}</span>
            </Typography>
         </div>
      </div>
   )
}

EmbedTimeDisplay.propTypes = {
   date: PropTypes.instanceOf(Date),
}
export default EmbedTimeDisplay
