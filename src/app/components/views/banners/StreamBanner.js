import PropTypes from "prop-types";
import Alert from "@material-ui/lab/Alert";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import OverflowTip from "../../views/tooltips/OverflowTip";
import { STREAM_ELEMENT_BORDER_RADIUS } from "constants/streams";

const useStyles = makeStyles((theme) => ({
   alertMessage: {
      display: "grid",
   },
   root: {
      borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
   },
}));

const StreamBanner = ({ action, severity, title, icon }) => {
   const classes = useStyles();

   return (
      <Alert
         className={classes.root}
         icon={icon}
         classes={{ message: classes.alertMessage }}
         action={action}
         severity={severity}
      >
         <OverflowTip title={title}>
            <Typography noWrap>{title}</Typography>
         </OverflowTip>
      </Alert>
   );
};

StreamBanner.propTypes = {
   title: PropTypes.string,
   action: PropTypes.node,
   severity: PropTypes.oneOf(["error", "warning", "info", "success"]),
   icon: PropTypes.node
};

export default StreamBanner;
