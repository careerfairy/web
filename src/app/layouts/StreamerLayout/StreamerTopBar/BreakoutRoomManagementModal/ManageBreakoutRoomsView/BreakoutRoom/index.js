import {useTheme} from "@material-ui/core/styles";
import {Accordion, AccordionSummary, Button} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import RenameRoomIcon from "@material-ui/icons/Edit";
import DeleteRoomIcon from "@material-ui/icons/Close";
import BreakoutRoomAccordionContent from './BreakoutRoomAccordionContent'
import React, {useState} from "react";
import EditRoomNameModal from "./EditRoomNameModal";
import AreYouSureModal from "materialUI/GlobalModals/AreYouSureModal";
import {useFirebase} from "context/firebase";
import {useRouter} from "next/router";
import * as actions from 'store/actions'
import {useDispatch} from "react-redux";

const BreakoutRoom = ({
                          breakoutRoom: {title, id, liveSpeakers},
                          openRoom,
                          rtmClient,
                          memberCount,
                          updateMemberCount,
                          handleOpenAccordion
                      }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const {deleteBreakoutRoom} = useFirebase()
    const {query: {livestreamId}} = useRouter()
    const [editRoomNameModalOpen, setEditRoomNameModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteBreakoutRoomModalOpen, setDeleteBreakoutRoomModalOpen] = useState(false);
    const closeEditRoomNameModal = () => setEditRoomNameModalOpen(false)
    const closeDeleteBreakoutRoomModal = () => setDeleteBreakoutRoomModalOpen(false)

    const handleChange = (panel) => (event, isExpanded) => {
        handleOpenAccordion(isExpanded ? panel : "");
    };

    const handleClickRename = (event) => {
        event.stopPropagation()
        setEditRoomNameModalOpen(true)
    }

    const handleClickDelete = (event) => {
        event.stopPropagation()
        setDeleteBreakoutRoomModalOpen(true)
    }

    const handleDeleteBreakoutRoom = async () => {
        setDeleting(true)
        try {
            await deleteBreakoutRoom(id, livestreamId)
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }
        setDeleting(false)
    }
    return (
        <React.Fragment>
            <Accordion
                onChange={handleChange(id)}
                expanded={openRoom === id}
                TransitionProps={{unmountOnExit: true}}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-label="Expand"
                    aria-controls="additional-actions1-content"
                    id="additional-actions1-header"
                >
                    <Box display="flex" width="100%" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">
                            {title}
                        </Typography>
                        <Button
                            onClick={handleClickRename}
                            startIcon={<RenameRoomIcon/>}
                        >
                            Rename
                        </Button>
                        <Button
                            onClick={handleClickDelete}
                            startIcon={<DeleteRoomIcon htmlColor={theme.palette.error.main}/>}
                        >
                            Delete
                        </Button>
                        <Typography variant="h6">
                            {memberCount}
                        </Typography>
                    </Box>
                </AccordionSummary>
                <BreakoutRoomAccordionContent
                    roomId={id}
                    rtmClient={rtmClient}
                    liveSpeakers={liveSpeakers}
                    updateMemberCount={updateMemberCount}
                />
            </Accordion>
            <EditRoomNameModal
                roomId={id}
                open={editRoomNameModalOpen}
                onClose={closeEditRoomNameModal}
                roomTitle={title}
            />
            <AreYouSureModal
                handleClose={closeDeleteBreakoutRoomModal}
                open={deleteBreakoutRoomModalOpen}
                handleConfirm={handleDeleteBreakoutRoom}
                loading={deleting}
                message="Are you sure that you want to delete this breakout room? The room will be deleted permanently"

            />
        </React.Fragment>
    )
}

export default BreakoutRoom
