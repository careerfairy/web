import React from "react";
import { GlassDialog } from "materialUI/GlobalModals";
import {
   Button,
   DialogActions,
   DialogTitle,
   Grow,
   Typography,
} from "@mui/material";

const styles = {
   title: {
      fontFamily: "Permanent Marker",
      fontSize: "2rem",
      color: (theme) => theme.palette.primary.main,
   },
} as const;

const Content = ({ handleClose, startConnectingHandRaise }: ContentProps) => {
   return (
      <React.Fragment>
         <DialogTitle>
            <Typography sx={styles.title} align="center">
               You've been invited to join with audio and video!
            </Typography>
         </DialogTitle>
         <DialogActions>
            <Button color="grey" children="Cancel" onClick={handleClose} />
            <Button
               variant="contained"
               children="Join now"
               color="primary"
               onClick={startConnectingHandRaise}
            />
         </DialogActions>
      </React.Fragment>
   );
};
const HandRaiseJoinDialog = ({
   open,
   onClose,
   startConnectingHandRaise,
}: DialogProps) => {
   const handleClose = () => {
      onClose();
   };

   return (
      <GlassDialog TransitionComponent={Grow} open={open}>
         <Content
            handleClose={handleClose}
            startConnectingHandRaise={startConnectingHandRaise}
         />
      </GlassDialog>
   );
};

type DialogProps = {
   open?: boolean;
   onClose: () => any;
   startConnectingHandRaise: () => Promise<void>;
};
type ContentProps = {
   handleClose: () => any;
   startConnectingHandRaise: () => Promise<void>;
};

export default HandRaiseJoinDialog;
