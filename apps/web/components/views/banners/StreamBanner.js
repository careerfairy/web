import PropTypes from "prop-types"
import Alert from "@mui/material/Alert"
import Typography from "@mui/material/Typography"
import makeStyles from "@mui/styles/makeStyles"
import OverflowTip from "../../views/tooltips/OverflowTip"
import { STREAM_ELEMENT_BORDER_RADIUS } from "constants/streams"
import { AlertTitle } from "@mui/material"
import clsx from "clsx"

const useStyles = makeStyles((theme) => ({
   alertMessage: {
      display: "grid",
   },
   root: {
      borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
   },
   title: {
      fontSize: "0.9rem",
      textTransform: "uppercase",
      fontWeight: 600,
   },
   titleWithNoSubtitle: {
      marginBottom: 0,
      marginTop: 0,
   },
}))

const StreamBanner = ({ action, severity, title, icon, subTitle }) => {
   const classes = useStyles()

   return (
      <Alert
         className={classes.root}
         icon={icon}
         classes={{ message: classes.alertMessage }}
         action={action}
         severity={severity}
      >
         {title && (
            <OverflowTip title={title}>
               <AlertTitle
                  className={clsx(classes.title, {
                     [classes.titleWithNoSubtitle]: !subTitle,
                  })}
                  noWrap
               >
                  {title}
               </AlertTitle>
            </OverflowTip>
         )}
         {subTitle && <OverflowTip title={subTitle}>{subTitle}</OverflowTip>}
      </Alert>
   )
}

StreamBanner.propTypes = {
   title: PropTypes.string,
   action: PropTypes.node,
   severity: PropTypes.oneOf(["error", "warning", "info", "success"]),
   icon: PropTypes.node,
}

export default StreamBanner
