import makeStyles from "@mui/styles/makeStyles"
import { Tooltip, Typography } from "@mui/material"
import React from "react"
import HelpIcon from "@mui/icons-material/HelpOutlineOutlined"
import PropTypes from "prop-types"

const useStyles = makeStyles((theme) => ({
   root: {},
   tooltip: {
      padding: theme.spacing(2),
   },
   description: {
      fontSize: "0.85rem",
   },
   title: {
      fontSize: "0.875rem",
      textTransform: "uppercase",
      marginBottom: "0.3em",
      fontWeight: 700,
   },
}))

const HintIcon = ({ title, description }) => {
   const classes = useStyles()
   return (
      <Tooltip
         arrow
         classes={{
            tooltip: classes.tooltip,
         }}
         placement="right"
         title={
            <React.Fragment>
               <Typography className={classes.title}>{title}</Typography>
               <Typography className={classes.description} variant="body1">
                  {description}
               </Typography>
            </React.Fragment>
         }
      >
         <HelpIcon />
      </Tooltip>
   )
}

HintIcon.propTypes = {
   description: PropTypes.string,
   title: PropTypes.string,
}

export default HintIcon
