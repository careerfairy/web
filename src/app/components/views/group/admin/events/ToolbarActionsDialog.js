import PropTypes from "prop-types";
import React, { useState } from "react";
import {
   Dialog,
   List,
   ListItem,
   ListItemIcon,
   ListItemSecondaryAction,
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
import HintIcon from "../../../common/HintIcon";

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
         description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      },
      {
         name: "Draft a new stream",
         onClick: () => {
            handleOpenNewStreamModal();
            handleClose();
         },
         icon: <StreamIcon />,
         description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      },
      {
         name: "View your upcoming streams on the student page",
         onClick: () => {
            handleOpenStudentView();
            handleClose();
         },
         icon: <OpenInBrowserIcon />,
         description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
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
                  <ListItemSecondaryAction>
                     <HintIcon
                        title={action.name}
                        description={action.description}
                     />
                  </ListItemSecondaryAction>
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
