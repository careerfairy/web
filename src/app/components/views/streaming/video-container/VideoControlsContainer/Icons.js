import ShareIconSvg from "@mui/icons-material/SystemUpdateAlt";
import PDFSvg from "@mui/icons-material/PictureAsPdf";
import CallToActionSvg from "@mui/icons-material/Link";
import makeStyles from '@mui/styles/makeStyles';

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
