import PropTypes from "prop-types";
import Alert from "@material-ui/lab/Alert";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import OverflowTip from "../../views/tooltips/OverflowTip";

const useStyles = makeStyles((theme) => ({
   alertMessage: {
      display: "grid",
   },
}));

const StreamBanner = ({ action, severity, title }) => {
   const classes = useStyles();

   return (
      <Alert
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
};

export default StreamBanner;
