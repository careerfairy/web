import PropTypes from 'prop-types'
import {useTheme} from "@material-ui/core/styles";
import {Accordion, AccordionSummary, Button, Chip, CircularProgress, Grid, IconButton} from "@material-ui/core";
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
import {useDispatch} from "react-redux";
import {useCurrentStream} from "../../../../../../context/stream/StreamContext";
import useStreamToken from "../../../../../../components/custom-hook/useStreamToken";
import {addQueryParam} from "../../../../../../components/helperFunctions/HelperFunctions";

const RoomClosedActions = ({handleClickRename, handleClickDelete, handleOpenRoom, loading, mobile}) => {
    const theme = useTheme()
    return <React.Fragment>
        <Grid item xs={2}>
            <Button
                onClick={handleOpenRoom}
                disabled={loading}
            >
                Open
            </Button>
        </Grid>
        <Grid item xs={mobile ? 1 : 2}>
            {mobile ? (
                <IconButton size="small" onClick={handleClickRename}
                            disabled={loading}>
                    <RenameRoomIcon/>
                </IconButton>
            ) : (
                <Button
                    onClick={handleClickRename}
                    disabled={loading}
                    startIcon={<RenameRoomIcon/>}
                >
                    Rename
                </Button>
            )}
        </Grid>
        <Grid item xs={mobile ? 1 : 2}>
            {mobile ? (
                <IconButton size="small" onClick={handleClickDelete}
                            disabled={loading}>
                    <DeleteRoomIcon htmlColor={theme.palette.error.main}/>
                </IconButton>
            ) : (
                <Button
                    onClick={handleClickDelete}
                    disabled={loading}
                    startIcon={<DeleteRoomIcon htmlColor={theme.palette.error.main}/>}
                >
                    Delete
                </Button>
            )}
        </Grid>
    </React.Fragment>;
};

const RoomOpenedActions = ({handleClickRename, handleJoinRoom, loading, roomId, mobile, handleCloseRoom}) => {
    const theme = useTheme()

    const {query: {breakoutRoomId}, push} = useRouter()

    return <React.Fragment>
        <Grid item xs={2}>
            <Button
                onClick={handleCloseRoom}
                disabled={loading}
            >
                {mobile ? "Close":"Close Room"}
            </Button>
        </Grid>
        <Grid item xs={2}>
            {roomId !== breakoutRoomId && (
                <Button
                    onClick={handleJoinRoom}
                    disabled={loading}
                >
                    {mobile ? "Join":"Join Room"}
                </Button>
            )}
        </Grid>
        <Grid item xs={mobile ? 1 : 2}>
            {mobile ? (
                <IconButton size="small" onClick={handleClickRename}
                            disabled={loading}>
                    <RenameRoomIcon/>
                </IconButton>
            ) : (
                <Button
                    onClick={handleClickRename}
                    disabled={loading}
                    startIcon={<RenameRoomIcon/>}
                >
                    Rename
                </Button>
            )}
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
                          memberCount,
                          updateMemberCount,
                          handleOpenAccordion,
                          handleDisconnect,
                          handleClose,
                          refreshing,
                          mobile,
                          agoraHandlers
                      }) => {

    const dispatch = useDispatch()
    const links = useStreamToken({forStreamType: "breakoutRoom", targetBreakoutRoomId: id})

    const {isStreamer, isMainStreamer, isBreakout} = useCurrentStream()
    const {deleteBreakoutRoom, updateBreakoutRoom} = useFirebase()
    const {query: {livestreamId}} = useRouter()
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
            await updateBreakoutRoom({hasStarted: false, hasEnded: true}, id, livestreamId)
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
        window.location.href = addQueryParam(breakoutRoomLink, "auto=true")
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
                        <Grid container spacing={1}
                              direction="row"
                              justify="space-between"
                              alignItems="center"

                        >
                            <Grid item xs={3}>
                                <Typography
                                    variant="subtitle1">
                                    {title}
                                </Typography>
                            </Grid>
                            <Grid item xs={mobile ? 3:2}>
                                <Chip
                                    label={
                                        <Typography variant="caption">
                                            {hasStarted ? "OPEN" : "CLOSED"}
                                        </Typography>
                                    }
                                    title={hasStarted ? "OPEN" : "CLOSED"}
                                    color={hasStarted ? "primary" : "secondary"}
                                />
                            </Grid>
                            {hasStarted ? (
                                <RoomOpenedActions
                                    loading={loading}
                                    roomId={id}
                                    mobile={mobile}
                                    handleJoinRoom={handleJoinRoom}
                                    handleCloseRoom={handleCloseRoom}
                                    handleClickRename={handleClickRename}
                                    breakoutRoomLink={breakoutRoomLink}
                                />
                            ) : (
                                <RoomClosedActions
                                    loading={loading}
                                    mobile={mobile}
                                    handleClickRename={handleClickRename}
                                    handleOpenRoom={handleOpenRoom}
                                    handleClickDelete={handleClickDelete}
                                />
                            )}
                            <Grid style={{display: "flex", alignItems: "center", justifyContent: "center"}} item xs={1}>
                                {refreshing ? (
                                    <CircularProgress/>
                                ) : (
                                    <Typography variant="h6">
                                        {memberCount}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </AccordionSummary>
                <BreakoutRoomAccordionContent
                    roomId={id}
                    agoraHandlers={agoraHandlers}
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
