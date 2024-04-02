import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import StudentViewIcon from "@mui/icons-material/FaceRounded"
import ShareIcon from "@mui/icons-material/Share"
import {
   Dialog,
   List,
   ListItem,
   ListItemIcon,
   ListItemSecondaryAction,
   ListItemText,
   Paper,
   Slide,
} from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { buildLivestreamObject } from "components/helperFunctions/streamFormFunctions"
import { getLivestreamInitialValues } from "components/views/draftStreamForm/DraftStreamForm"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"
import PropTypes from "prop-types"
import { useState } from "react"
import { Film as StreamIcon } from "react-feather"
import {
   copyStringToClipboard,
   getBaseUrl,
} from "../../../../helperFunctions/HelperFunctions"
import HintIcon from "../../../common/HintIcon"

const handleCreateDraftLivestream = async (
   authenticatedUser,
   group,
   firebase,
   router
) => {
   const author = {
      groupId: group.id,
      email: authenticatedUser.email,
   }

   const initialValues = getLivestreamInitialValues(group)
   initialValues.groupIds = [group.id]
   const draftLivestream: LivestreamEvent = buildLivestreamObject(
      initialValues,
      false,
      null,
      firebase
   )

   const draftLiveStreamId = await firebase.addLivestream(
      draftLivestream,
      "draftLivestreams",
      author,
      null
   )

   return router.push({
      pathname: `/group/${group.id}/admin/events/${draftLiveStreamId}`,
   })
}

const ToolbarActionsDialogContent = ({
   handleClose,
   handleOpenNewStreamModal,
   group,
}) => {
   const router = useRouter()
   const firebase = useFirebaseService()
   const { authenticatedUser } = useAuth()
   const featureFlags = useFeatureFlags()
   const { enqueueSnackbar } = useSnackbar()

   const handleNewStream_v2 = async () => {
      await handleCreateDraftLivestream(
         authenticatedUser,
         group,
         firebase,
         router
      )
   }

   // eslint-disable-next-line react/hook-use-state
   const [actions] = useState([
      {
         name: "Create a draft live stream",
         onClick: () => {
            handleOpenNewStreamModal()
            handleClose()
         },
         icon: <StreamIcon />,
         description:
            "Create a draft live stream event. This event will be created as a draft and will not be visible to the public until you explicitly publish it.",
      },
      ...(featureFlags.livestreamCreationFlowV2
         ? [
              {
                 name: "Create a draft live stream V2",
                 onClick: async () => {
                    await handleNewStream_v2()
                 },
                 icon: <StreamIcon />,
                 description: "New live stream creation form!",
              },
           ]
         : []),
      {
         name: "Share a link to create a draft live stream",
         onClick: () => {
            handleShareDraftLink()
            handleClose()
         },
         icon: <ShareIcon />,
         description:
            "This button copies a shareable link to your clipboard to create a new live stream draft. You can send this link to anyone in charge of setting up a live stream for your CareerFairy group. The stream that they create will not be published and only visible by you as a draft within this dashboard.",
      },
      {
         name: "See your upcoming streams as a student",
         onClick: () => {
            handleOpenStudentView()
            handleClose()
         },
         icon: <StudentViewIcon />,
         description:
            "Go to your public group page and see your events as a student.",
      },
   ])

   const handleShareDraftLink = () => {
      let baseUrl = "https://careerfairy.io"
      if (window?.location?.origin) {
         baseUrl = window.location.origin
      }
      const groupId = group.id
      const targetPath = `${baseUrl}/draft-stream?careerCenterIds=${groupId}`
      copyStringToClipboard(targetPath)
      enqueueSnackbar("Link has been copied to your clipboard", {
         variant: "default",
         preventDuplicate: true,
      })
   }

   const handleOpenStudentView = () => {
      const baseUrl = getBaseUrl()
      const studentPage = `${baseUrl}/next-livestreams/${group.id}`
      window?.open?.(studentPage, "_blank")
   }

   return (
      <Paper>
         <List>
            {actions.map((action) => (
               // eslint-disable-next-line react/jsx-handler-names
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
   )
}

ToolbarActionsDialogContent.propTypes = {
   handleClose: PropTypes.func,
}

const ToolbarActionsDialog = ({
   openDialog,
   onClose,
   group,
   handleOpenNewStreamModal,
}) => {
   const handleClose = () => {
      onClose?.()
   }

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
   )
}

ToolbarActionsDialog.propTypes = {
   onClose: PropTypes.func,
   openDialog: PropTypes.bool,
   reportPdfData: PropTypes.shape({
      summary: PropTypes.object,
      groupReports: PropTypes.array,
   }),
}

export default ToolbarActionsDialog
