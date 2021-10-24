import PropTypes from "prop-types";
import React, { useState } from "react";
import {
   Dialog,
   List,
   ListItem,
   ListItemIcon,
   ListItemText,
   Paper,
   Slide,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import {
   copyStringToClipboard,
   getBaseUrl,
} from "../../../../helperFunctions/HelperFunctions";
import ShareIcon from "@material-ui/icons/Share";
import { Film as StreamIcon } from "react-feather";
import OpenInBrowserIcon from "@material-ui/icons/OpenInBrowser";

const ToolbarActionsDialogContent = ({
   handleClose,
   handleOpenNewStreamModal,
   group,
}) => {
   const { enqueueSnackbar } = useSnackbar();

   const [actions] = useState([
      {
         name: "Generate a draft link for companies",
         onClick: () => {
            handleShareDraftLink();
            handleClose();
         },
         icon: <ShareIcon />,
      },
      {
         name: "Draft a new stream",
         onClick: () => {
            handleOpenNewStreamModal();
            handleClose();
         },
         icon: <StreamIcon />,
      },
      {
         name: "View your upcoming streams on the student page",
         onClick: () => {
            handleOpenStudentView();
            handleClose();
         },
         icon: <OpenInBrowserIcon />,
      },
   ]);

   const handleShareDraftLink = () => {
      let baseUrl = "https://careerfairy.io";
      if (window?.location?.origin) {
         baseUrl = window.location.origin;
      }
      const groupId = group.id;
      const targetPath = `${baseUrl}/draft-stream?careerCenterIds=${groupId}`;
      copyStringToClipboard(targetPath);
      enqueueSnackbar("Link has been copied to your clipboard", {
         variant: "default",
         preventDuplicate: true,
      });
   };

   const handleOpenStudentView = () => {
      const baseUrl = getBaseUrl();
      const studentPage = `${baseUrl}/next-livestreams/${group.id}`;
      window?.open?.(studentPage, "_blank");
   };

   return (
      <Paper>
         <List>
            {actions.map((action) => (
               <ListItem key={action.name} onClick={action.onClick} button>
                  <ListItemIcon>{action.icon}</ListItemIcon>
                  <ListItemText>{action.name}</ListItemText>
               </ListItem>
            ))}
         </List>
      </Paper>
   );
};

ToolbarActionsDialogContent.propTypes = {
   handleClose: PropTypes.func,
};

const ToolbarActionsDialog = ({
   openDialog,
   onClose,
   group,
   handleOpenNewStreamModal,
}) => {
   const handleClose = () => {
      onClose?.();
   };

   return (
      <Dialog
         open={openDialog}
         onClose={handleClose}
         TransitionComponent={Slide}
         maxWidth={"xs"}
         fullWidth
         aria-labelledby="pdf-report-download-dialog"
      >
         <ToolbarActionsDialogContent
            group={group}
            handleOpenNewStreamModal={handleOpenNewStreamModal}
            handleClose={handleClose}
         />
      </Dialog>
   );
};

ToolbarActionsDialog.propTypes = {
   onClose: PropTypes.func,
   openDialog: PropTypes.bool,
   reportPdfData: PropTypes.shape({
      summary: PropTypes.object,
      groupReports: PropTypes.array,
   }),
};

export default ToolbarActionsDialog;
