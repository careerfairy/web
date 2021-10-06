import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Box,
   Button,
   FormControl,
   IconButton,
   InputAdornment,
   InputLabel,
   OutlinedInput,
   Tooltip
} from "@material-ui/core";
import LinkIcon from "@material-ui/icons/Link";
import { useCopyToClipboard } from "react-use";

const useStyles = makeStyles((theme) => ({
   copyOverlayButton: {
      position: "absolute",
      height: "100%",
      right: 0,
   },
   copyOverlay: {
      position: "absolute",
      height: "100%",
      right: 0,
      width: "clamp(150px, 40%, 40%)",
      background: `linear-gradient(270deg, ${theme.palette.grey[200]} 51.35%,hsla(0,0%,100%,0) 107.43%)`
   },
}));

const CopyLinkField = ({ linkUrl }) => {
   const [copiedFromIcon, setCopiedFromIcon] = useState(false);
   const [copiedFromButton, setCopiedFromButton] = useState(false);
   const classes = useStyles();
   const [_, copyToClipboard] = useCopyToClipboard();
   const copyFromIcon = () => {
      copyToClipboard(linkUrl);
      setCopiedFromIcon(true);
   };
   const copyFromButton = () => {
      copyToClipboard(linkUrl);
      setCopiedFromButton(true);
   };

   useEffect(() => {
      if (copiedFromIcon) {
         setTimeout(() => {
            setCopiedFromIcon(false);
         }, 2000);
      }
   }, [copiedFromIcon]);
   useEffect(() => {
      if (copiedFromButton) {
         setTimeout(() => {
            setCopiedFromButton(false);
         }, 2000);
      }
   }, [copiedFromButton]);

   return (
      <FormControl variant="outlined">
         {/*<InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>*/}
         <OutlinedInput
            id="copy-link-field"
            type={"text"}
            value={linkUrl}
            onChange={() => {}}
            startAdornment={
               <InputAdornment position="start">
                  <Tooltip
                     title="Copied!"
                     placement="top"
                     open={copiedFromIcon}
                     enterDelay={500}
                     PopperProps={{
                        disablePortal: true,
                     }}
                     leaveDelay={200}
                     disableFocusListener
                     disableHoverListener
                     disableTouchListener
                  >
                     <IconButton
                        aria-label="toggle password visibility"
                        onClick={copyFromIcon}
                        edge="start"
                        size="small"
                     >
                        <LinkIcon />
                     </IconButton>
                  </Tooltip>
               </InputAdornment>
            }
         />
         <Box
           className={classes.copyOverlay}
         >
         <Tooltip
            title="Copied!"
            placement="top"
            open={copiedFromButton}
            enterDelay={500}
            PopperProps={{
               disablePortal: true,
            }}
            leaveDelay={200}
            disableFocusListener
            disableHoverListener
            disableTouchListener
         >
            <Button
               onClick={copyFromButton}
               className={classes.copyOverlayButton}
            >
               Copy
            </Button>
         </Tooltip>
         </Box>
      </FormControl>
   );
};

CopyLinkField.propTypes = {
   linkUrl: PropTypes.string.isRequired,
};

export default CopyLinkField;
