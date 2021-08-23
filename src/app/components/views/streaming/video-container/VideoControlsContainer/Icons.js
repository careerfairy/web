import ShareIconSvg from "@material-ui/icons/SystemUpdateAlt";
import PDFSvg from "@material-ui/icons/PictureAsPdf";
import CallToActionSvg from "@material-ui/icons/Link";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   shareIcon: {
      transform: "rotate(180deg)",
      "-webkit-transform": "rotate(180deg)",
   },
}));

export const ShareIcon = ({ ...props }) => {
   const classes = useStyles();
   return <ShareIconSvg className={classes.shareIcon} {...props} />;
};
export const SharePdfIcon = (props) => <PDFSvg {...props} />;
export const CallToActionIcon = (props) => <CallToActionSvg {...props} />;
