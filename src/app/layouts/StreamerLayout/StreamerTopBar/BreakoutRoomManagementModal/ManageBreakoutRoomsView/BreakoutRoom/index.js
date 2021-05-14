import PropTypes from 'prop-types'
import {useTheme} from "@material-ui/core/styles";
import {Accordion, AccordionSummary, Button, Chip, Grid} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import RenameRoomIcon from "@material-ui/icons/Edit";
import DeleteRoomIcon from "@material-ui/icons/Close";
import BreakoutRoomAccordionContent from './BreakoutRoomAccordionContent'
import React, {useEffect, useState} from "react";
import EditRoomNameModal from "./EditRoomNameModal";
import AreYouSureModal from "materialUI/GlobalModals/AreYouSureModal";
import {useFirebase} from "context/firebase";
import {useRouter} from "next/router";
import * as actions from 'store/actions'
import {useDispatch, useSelector} from "react-redux";
import {useCurrentStream} from "../../../../../../context/stream/StreamContext";
import useStreamToken from "../../../../../../components/custom-hook/useStreamToken";

const RoomClosedActions = ({handleClickRename, handleClickDelete, handleOpenRoom, loading}) => {
    const theme = useTheme()
    return <React.Fragment>
        <Grid item xs={3}>
        <Button
            onClick={handleOpenRoom}
            disabled={loading}
            // startIcon={<RenameRoomIcon/>}
        >
            Open
        </Button>
        </Grid>
        <Grid item xs={3}>
        <Button
            onClick={handleClickRename}
            disabled={loading}
            startIcon={<RenameRoomIcon/>}
        >
            Rename
        </Button>
        </Grid>
        <Grid item xs={3}>
        <Button
            onClick={handleClickDelete}
            disabled={loading}
            startIcon={<DeleteRoomIcon htmlColor={theme.palette.error.main}/>}
        >
            Delete
        </Button>
        </Grid>
    </React.Fragment>;
};

const RoomOpenedActions = ({handleClickRename, handleJoinRoom, loading, roomId, breakoutRoomLink, handleCloseRoom}) => {
    const theme = useTheme()

    const {query: {breakoutRoomId}, push} = useRouter()

    return <React.Fragment>
        <Grid item xs={3}>
        <Button
            onClick={handleCloseRoom}
            disabled={loading}
        >
            Close Room
        </Button>
        </Grid>
        <Grid item xs={3}>
        {roomId !== breakoutRoomId && (
            <Button
                onClick={handleJoinRoom}
                disabled={loading}
                // href={breakoutRoomLink}
                // component="a"
                // component={Link}
            >
                Join Room
            </Button>
        )}
        </Grid>
        <Grid item xs={3}>
        <Button
            onClick={handleClickRename}
            disabled={loading}
            startIcon={<RenameRoomIcon/>}
        >
            Rename
        </Button>
        </Grid>
    </React.Fragment>;
};

RoomClosedActions.propTypes = {
    handleClickDelete: PropTypes.func.isRequired,
    handleClickRename: PropTypes.func.isRequired,
    handleOpenRoom: PropTypes.func.isRequired,
    loading: PropTypes.bool,
}
const BreakoutRoom = ({
                          breakoutRoom: {title, id, liveSpeakers, hasStarted},
                          openRoom,
                          rtmClient,
                          memberCount,
                          updateMemberCount,
                          handleOpenAccordion,
                          handleDisconnect,
                          handleClose
                      }) => {
    const dispatch = useDispatch()
    const links = useStreamToken({forStreamType: "breakoutRoom", targetBreakoutRoomId: id})
    const {isStreamer, isMainStreamer,isBreakout} = useCurrentStream()
    const {deleteBreakoutRoom, updateBreakoutRoom} = useFirebase()
    const {query: {livestreamId}, push, reload} = useRouter()
    const [editRoomNameModalOpen, setEditRoomNameModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleteBreakoutRoomModalOpen, setDeleteBreakoutRoomModalOpen] = useState(false);
    const [breakoutRoomLink, setBreakoutRoomLink] = useState("");

    useEffect(() => {
        const newBreakoutRoomLink = isMainStreamer ? links.mainStreamerLink : isStreamer ? links.joiningStreamerLink : links.viewerLink
        setBreakoutRoomLink(newBreakoutRoomLink)
    }, [links, isStreamer, isMainStreamer])
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

    const handleOpenRoom = async (event) => {
        event.stopPropagation()
        try {
            setLoading(true)
            await updateBreakoutRoom({hasStarted: true}, id, livestreamId)
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }
        setLoading(false)
    }
    const handleCloseRoom = async (event) => {
        event.stopPropagation()
        try {
            setLoading(true)
            await updateBreakoutRoom({hasStarted: false}, id, livestreamId)
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }
        setLoading(false)
    }

    const handleDeleteBreakoutRoom = async () => {
        setLoading(true)
        try {
            await deleteBreakoutRoom(id, livestreamId)
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }
        setLoading(false)
    }

    const handleJoinRoom = async (event) => {
        event.stopPropagation()
        // if(!isBreakout){
            await handleDisconnect()
        // }
        handleClose()
        // window.location.href = breakoutRoomLink
        await push({pathname: breakoutRoomLink, query: {auto: true}}, undefined, {shallow: false})
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
                        <Box flex={1} display="flex" marginLeft={3} alignItems="center" justifyContent="space-between">
                            <Grid container spacing={1}>
                            <Grid item xs={3}>
                            <Chip
                                title={hasStarted ? "OPEN" : "CLOSED"}
                                label={hasStarted ? "OPEN" : "CLOSED"}
                                color={hasStarted ? "primary" : "secondary"}
                            />
                            </Grid>
                            {hasStarted ? (
                                <RoomOpenedActions
                                    loading={loading}
                                    roomId={id}
                                    handleJoinRoom={handleJoinRoom}
                                    handleCloseRoom={handleCloseRoom}
                                    handleClickRename={handleClickRename}
                                    breakoutRoomLink={breakoutRoomLink}
                                />
                            ) : (
                                <RoomClosedActions
                                    loading={loading}
                                    handleClickRename={handleClickRename}
                                    handleOpenRoom={handleOpenRoom}
                                    handleClickDelete={handleClickDelete}
                                />
                            )}
                            </Grid>
                            <Typography variant="h6">
                                {memberCount}
                            </Typography>
                        </Box>
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
                loading={loading}
                message="Are you sure that you want to delete this breakout room? The room will be deleted permanently"
            />
        </React.Fragment>
    )
}

export default BreakoutRoom
