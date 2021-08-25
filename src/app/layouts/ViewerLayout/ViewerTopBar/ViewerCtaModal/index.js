import React, { useState } from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { Box, Button, Drawer, IconButton } from "@material-ui/core";
import { ThemedPermanentMarker } from "../../../../materialUI/GlobalTitles";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
   glass: {
      backgroundColor: alpha(theme.palette.common.black, 0.4),
      backdropFilter: "blur(5px)",
   },
   title: {
      textAlign: "left",
      fontSize: theme.typography.h2.fontSize,
      width: "auto",
   },
   modalButton: {
      color: theme.palette.common.white,
   },
}));

const Content = ({ callToActions, fullyOpened, handleClose, mobile }) => {
   const classes = useStyles();
   const closeProps = () => ({
      className: classes.modalButton,
      onClick: handleClose,
   });

   return (
      <div>
         <Box
            paddingY={1}
            paddingX={2}
            alignItems="center"
            justifyContent="space-between"
            display="flex"
         >
            <ThemedPermanentMarker className={classes.title}>
               Live Call to Actions
            </ThemedPermanentMarker>
            <Box flex={1} />
            {mobile ? (
               <IconButton {...closeProps()}>
                  <CloseIcon />
               </IconButton>
            ) : (
               <Button {...closeProps()}>Close</Button>
            )}
         </Box>
      </div>
   );
};

const ViewerCtaModal = ({ mobile }) => {
   const open = useSelector((state) => state.stream.layout.viewerCtaModalOpen);
   const dispatch = useDispatch();
   const classes = useStyles();
   const [fullyOpened, setFullyOpened] = useState(false);

   const handleClose = () => {
      dispatch(actions.closeViewerCtaModal());
   };

   const handleEntered = () => {
      setFullyOpened(true);
   };

   return (
      <Drawer
         anchor="top"
         open={open}
         PaperProps={{
            className: classes.glass,
         }}
         SlideProps={{
            onEntered: handleEntered,
         }}
         onClose={handleClose}
      >
         <Content
            fullyOpened={fullyOpened}
            mobile={mobile}
            callToActions={[]}
            handleClose={handleClose}
         />
      </Drawer>
   );
};

export default ViewerCtaModal;
