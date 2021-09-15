import React, { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
   Button,
   Divider,
   Grid,
   ListItem,
   ListItemText,
   Tooltip,
} from "@material-ui/core";
import TutorialContext from "context/tutorials/TutorialContext";
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "materialUI/GlobalTooltips";
import { alpha, makeStyles, useTheme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   root: {
      flexDirection: "column",
      alignItems: "flex-start",
      backgroundColor: ({ backgroundColor }) => backgroundColor && alpha(backgroundColor, 0.5),
      borderRadius: 5
   },
}));

const HandRaiseListItem = ({
   title,
   subtitle,
   primaryOnClick,
   primaryButtonText,
   primaryButtonDisabled,
   secondaryOnClick,
   secondaryButtonText,
   secondaryButtonDisabled,
   primaryDisabledMessage,
  backgroundColor
}) => {
   const classes = useStyles({backgroundColor});
   return (
      <React.Fragment>
         <ListItem color="blue" className={classes.root}>
            <Grid container spacing={1}>
               <Grid xs={12} item>
                  <ListItemText
                     primary={title}
                     primaryTypographyProps={{
                        noWrap: true,
                     }}
                     secondaryTypographyProps={{
                        noWrap: true,
                     }}
                     secondary={subtitle}
                  />
               </Grid>
               {primaryOnClick && (
                  <Grid item>
                     <Tooltip
                        title={
                           (primaryButtonDisabled && primaryDisabledMessage) ||
                           ""
                        }
                     >
                        <Button
                           size="small"
                           onClick={primaryOnClick}
                           color="primary"
                           disabled={primaryButtonDisabled}
                           variant="outlined"
                        >
                           {primaryButtonText}
                        </Button>
                     </Tooltip>
                  </Grid>
               )}
               {secondaryOnClick && (
                  <Grid item>
                     <Button
                        size="small"
                        onClick={secondaryOnClick}
                        disabled={secondaryButtonDisabled}
                        variant="outlined"
                     >
                        {secondaryButtonText}
                     </Button>
                  </Grid>
               )}
            </Grid>
         </ListItem>
         <Divider component="li" />
      </React.Fragment>
   );
};

function RequestedHandRaiseElement(props) {
   const [notificationId] = useState(uuidv4());
   const { getActiveTutorialStepKey, handleConfirmStep, isOpen } = useContext(
      TutorialContext
   );

   const activeStep = getActiveTutorialStepKey();

   useEffect(() => {
      if (props.numberOfActiveHandRaisers < 8) {
         props.setNewNotification({
            status: "requested",
            id: notificationId,
            message:
               props.request.name +
               " has raised a hand and requested to join the stream",
            confirmMessage: "Invite",
            confirm: () =>
               props.updateHandRaiseRequest(props.request.id, "invited"),
            cancelMessage: "Deny",
            cancel: () =>
               props.updateHandRaiseRequest(props.request.id, "denied"),
         });

         return () => props.closeSnackbar(notificationId);
      }
   }, []);

   function updateHandRaiseRequest(state) {
      props.updateHandRaiseRequest(props.request.id, state);
      props.setNotificationToRemove(notificationId);
   }

   return (
      <WhiteTooltip
         placement="right-start"
         style={{ width: "100%" }}
         title={
            <React.Fragment>
               <TooltipTitle>Hand Raise (2/5)</TooltipTitle>
               <TooltipText>
                  All the viewers who request to join your stream appear here.
                  You can invite them in by clicking on the corresponding
                  button.
               </TooltipText>
               {activeStep === 10 && (
                  <TooltipButtonComponent
                     onConfirm={() => {
                        handleConfirmStep(10);
                        updateHandRaiseRequest("connected");
                     }}
                     buttonText="Ok"
                  />
               )}
            </React.Fragment>
         }
         open={Boolean(props.hasEntered && isOpen(10))}
      >
         <HandRaiseListItem
            primaryOnClick={() => {
               if (isOpen(10)) {
                  handleConfirmStep(10);
                  updateHandRaiseRequest("connected");
               } else {
                  updateHandRaiseRequest("invited");
               }
            }}
            primaryButtonText={"Invite to speak"}
            primaryButtonDisabled={props.numberOfActiveHandRaisers > 7}
            title={"HAND RAISED"}
            secondaryOnClick={() => updateHandRaiseRequest("denied")}
            secondaryButtonText={"Deny"}
            secondaryButtonDisabled={isOpen(10)}
            primaryDisabledMessage={
               "You cannot invite more than 8 people simultaneously in hand raise"
            }
            subtitle={props.request.name}
         />
      </WhiteTooltip>
   );
}

function InvitedHandRaiseElement(props) {
   const theme = useTheme()
   return (
      <HandRaiseListItem
         title={"INVITED"}
         backgroundColor={theme.palette.primary.main}
         secondaryOnClick={() =>
            props.updateHandRaiseRequest(props.request.id, "denied")
         }
         subtitle={props.request.name}
         secondaryButtonText={"Remove"}
      />
   );
}

function ConnectingHandRaiseElement(props) {
   const [notificationId] = useState(uuidv4());

   useEffect(() => {
      props.setNewNotification({
         status: "connecting",
         id: notificationId,
         message: props.request.name + " is now connecting to the stream",
         confirmMessage: "OK",
         confirm: () => {},
         cancelMessage: "Stop Connection",
         cancel: () => props.updateHandRaiseRequest(props.request.id, "denied"),
      });

      return () => props.closeSnackbar(notificationId);
   }, []);

   function updateHandRaiseRequest(state) {
      props.updateHandRaiseRequest(props.request.id, state);
      props.setNotificationToRemove(notificationId);
   }

   return (
      <HandRaiseListItem
         title={"CONNECTING"}
         secondaryOnClick={() => updateHandRaiseRequest("denied")}
         subtitle={props.request.name}
         secondaryButtonText={"Remove"}
      />
   );
}

function ConnectedHandRaiseElement(props) {

   const [notificationId] = useState(uuidv4());
   const { getActiveTutorialStepKey, handleConfirmStep, isOpen } = useContext(
      TutorialContext
   );

   const activeStep = getActiveTutorialStepKey();

   useEffect(() => {
      props.setNewNotification({
         status: "connected",
         id: notificationId,
         message: props.request.name + " is now connected to the stream",
         confirmMessage: "OK",
         confirm: () => {},
         cancelMessage: "Remove from Stream",
         cancel: () => props.updateHandRaiseRequest(props.request.id, "denied"),
      });

      return () => props.closeSnackbar(notificationId);
   }, []);

   function updateHandRaiseRequest(state) {
      props.updateHandRaiseRequest(props.request.id, state);
      props.setNotificationToRemove(notificationId);
   }

   return (
      <WhiteTooltip
         placement="right"
         style={{ width: "100%" }}
         title={
            <React.Fragment>
               <TooltipTitle>Hand Raise (4/5)</TooltipTitle>
               <TooltipText>
                  At any time, you can remove a hand raiser by clicking on the
                  corresponding button.
               </TooltipText>
               {activeStep === 12 && (
                  <TooltipButtonComponent
                     onConfirm={() => {
                        handleConfirmStep(12);
                        updateHandRaiseRequest("denied");
                     }}
                     buttonText="Ok"
                  />
               )}
            </React.Fragment>
         }
         open={isOpen(12)}
      >
         <HandRaiseListItem
            title={"CONNECTED"}
            primaryOnClick={() => {
               if (isOpen(12)) {
                  handleConfirmStep(12);
               }
               updateHandRaiseRequest("denied");
            }}
            subtitle={props.request.name}
            primaryButtonText={"Remove"}
            primaryButtonDisabled={isOpen(11)}
         />
      </WhiteTooltip>
   );
}

function HandRaiseElement(props) {
   if (props.request.state === "requested") {
      return <RequestedHandRaiseElement {...props} />;
   }
   if (props.request.state === "invited") {
      return <InvitedHandRaiseElement {...props} />;
   }
   if (props.request.state === "connecting") {
      return <ConnectingHandRaiseElement {...props} />;
   }
   if (props.request.state === "connected") {
      return <ConnectedHandRaiseElement {...props} />;
   }
}

export default HandRaiseElement;
