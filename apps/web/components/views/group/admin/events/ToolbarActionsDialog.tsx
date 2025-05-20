import { Group } from "@careerfairy/shared-lib/groups"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import StudentViewIcon from "@mui/icons-material/FaceRounded"
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
import PropTypes from "prop-types"
import { useState } from "react"
import { Film as StreamIcon } from "react-feather"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import HintIcon from "../../../common/HintIcon"
import { useLivestreamRouting } from "./useLivestreamRouting"

type ToolbarActionsDialogContentProps = {
   handleClose: () => void
   group: Group
}

const ToolbarActionsDialogContent = ({
   handleClose,
   group,
}: ToolbarActionsDialogContentProps) => {
   const { createDraftLivestream } = useLivestreamRouting()

   const handleNewStream_v2 = async () => {
      await createDraftLivestream()
   }

   // eslint-disable-next-line react/hook-use-state
   const [actions] = useState([
      {
         name: "Create a draft live stream",
         onClick: async () => {
            await handleNewStream_v2()
         },
         icon: <StreamIcon />,
         description: "New live stream creation form!",
      },
      ...(group.publicProfile
         ? [
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
           ]
         : []),
   ])

   const handleOpenStudentView = () => {
      const studentPage = makeGroupCompanyPageUrl(group.universityName, {
         interactionSource: SparkInteractionSources.Group_Admin_Events_Table,
      })
      window?.open?.(`${studentPage}#livesStreams-section`, "_blank")
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

const ToolbarActionsDialog = ({ openDialog, onClose, group }) => {
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
         <ToolbarActionsDialogContent group={group} handleClose={handleClose} />
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
