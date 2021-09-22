import PropTypes from "prop-types";
import Alert from "@material-ui/lab/Alert";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import OverflowTip from "../../views/tooltips/OverflowTip";
import { STREAM_ELEMENT_BORDER_RADIUS } from "constants/streams";
import { AlertTitle } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
   alertMessage: {
      display: "grid",
      marginBottom: ({ hasSubtitle }) => (hasSubtitle ? 0 : undefined),
   },
   root: {
      borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
   },
   title: {
      fontSize: "0.9rem",
      textTransform: "uppercase",
      fontWeight: 600,
   },
}));

const StreamBanner = ({ action, severity, title, icon, subTitle }) => {
   const classes = useStyles({ hasSubtitle: Boolean(subTitle) });

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
               <AlertTitle className={classes.title} noWrap>
                  {title}
               </AlertTitle>
            </OverflowTip>
         )}
         {subTitle && <OverflowTip title={subTitle}>{subTitle}</OverflowTip>}
      </Alert>
   );
};

StreamBanner.propTypes = {
   title: PropTypes.string,
   action: PropTypes.node,
   severity: PropTypes.oneOf(["error", "warning", "info", "success"]),
   icon: PropTypes.node,
};

export default StreamBanner;
