import PropTypes from 'prop-types'
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {
    Accordion,
    AccordionSummary,
    Button,
    Chip,
    CircularProgress,
    Grid,
    IconButton, Menu, MenuItem,
    Tooltip
} from "@material-ui/core";
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
import clsx from "clsx";


const useStyles = makeStyles(theme => ({
    root: {},
    activeRoom: {
        background: theme.palette.primary.main,
        color: theme.palette.common.white
    },
    activeColor: {
        color: theme.palette.common.white
    },
    statusActive: {
        background: theme.palette.common.white
    },
    status: {}
}));
const RoomClosedActions = ({
                               handleClickRename,
                               handleClickDelete,
                               handleOpenRoom,
                               loading,
                               mobile,
                               isMainStreamer,
                               active
                           }) => {
    const theme = useTheme()
    const classes = useStyles()
    return <React.Fragment>
        <Grid item xs={2}>
            {isMainStreamer &&
            <Button
                onClick={handleOpenRoom}
                className={clsx({
                    [classes.activeColor]: active
                })}
                disabled={loading}
            >
                Open
            </Button>}
        </Grid>
        <Grid item xs={mobile ? 1 : 2}>
            {isMainStreamer &&
            <React.Fragment>
                {mobile ? (
                    <IconButton size="small" onClick={handleClickRename}
                                disabled={loading}>
                        <RenameRoomIcon
                            className={clsx({
                                [classes.activeColor]: active
                            })}/>
                    </IconButton>
                ) : (
                    <Button
                        onClick={handleClickRename}
                        disabled={loading}
                        className={clsx({
                            [classes.activeColor]: active
                        })}
                        startIcon={<RenameRoomIcon/>}
                    >
                        Rename
                    </Button>
                )}
            </React.Fragment>}
        </Grid>
        <Grid item xs={mobile ? 1 : 2}>
            {isMainStreamer &&
            <React.Fragment>
                {mobile ? (
                    <IconButton size="small" onClick={handleClickDelete}
                                disabled={loading}>
                        <DeleteRoomIcon htmlColor={theme.palette.error.main}/>
                    </IconButton>
                ) : (
                    <Button
                        onClick={handleClickDelete}
                        disabled={loading}
                        className={clsx({
                            [classes.activeColor]: active
                        })}
                        startIcon={<DeleteRoomIcon htmlColor={theme.palette.error.main}/>}
                    >
                        Delete
                    </Button>
                )}
            </React.Fragment>}
        </Grid>
    </React.Fragment>;
};

const RoomOpenedActions = ({
                               handleClickRename,
                               handleJoinRoom,
                               loading,
                               roomId,
                               mobile,
                               handleCloseRoom,
                               isMainStreamer,
                               joinAsMenuData,
                               handleCloseJoinAsMenu,
                               active,
                               handleGoToRoomWithNewProfile,
                               handleGoToRoomWithAutoProfile,
                           }) => {
    const classes = useStyles()
    const {query: {breakoutRoomId}} = useRouter()

    return <React.Fragment>
        <Grid item xs={2}>
            {isMainStreamer &&
            <Button
                onClick={handleCloseRoom}
                disabled={loading}
                className={clsx({
                    [classes.activeColor]: active
                })}
            >
                {mobile ? "Close" : "Close Room"}
            </Button>
            }
        </Grid>
        <Grid item xs={mobile ? 2 : 2}>
            {(roomId !== breakoutRoomId) ? (
                <React.Fragment>
                    <Button
                        onClick={handleJoinRoom}
                        disabled={loading}
                        variant="contained"
                        color="primary"
                        className={clsx({
                            [classes.activeColor]: active
                        })}
                    >
                        {mobile ? "Join" : "Join Room"}
                    </Button>
                    <Menu
                        id="join-as-menu"
                        anchorEl={joinAsMenuData.anchorEl}
                        keepMounted
                        open={Boolean(joinAsMenuData.anchorEl)}
                        onClose={handleCloseJoinAsMenu}
                    >
                        <MenuItem onClick={handleGoToRoomWithAutoProfile}>Join
                            as {joinAsMenuData?.profile?.firstName}</MenuItem>
                        <MenuItem onClick={handleGoToRoomWithNewProfile}>Join with a different profile</MenuItem>
                    </Menu>
                </React.Fragment>
            ) : (
                <Tooltip title="You are in this room">
                    <Typography align="center" style={{fontWeight: 600}}>
                        You Are Here
                    </Typography>
                </Tooltip>
            )}
        </Grid>
        <Grid item xs={mobile ? 1 : 2}>
            {isMainStreamer &&
            <React.Fragment>
                {mobile ? (
                    <IconButton size="small" onClick={handleClickRename}
                                className={clsx({
                                    [classes.activeColor]: active
                                })}
                                disabled={loading}>
                        <RenameRoomIcon/>
                    </IconButton>
                ) : (
                    <Button
                        onClick={handleClickRename}
                        disabled={loading}
                        className={clsx({
                            [classes.activeColor]: active
                        })}
                        startIcon={<RenameRoomIcon/>}
                    >
                        Rename
                    </Button>
                )}
            </React.Fragment>}
        </Grid>
    </React.Fragment>;
};

RoomClosedActions.propTypes = {
    handleClickDelete: PropTypes.func.isRequired,
    handleClickRename: PropTypes.func.isRequired,
    handleOpenRoom: PropTypes.func.isRequired,
    loading: PropTypes.bool,
}
const initialJoinAsData = {anchorEl: null, profile: null, link: ""}
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
    const classes = useStyles()
    const dispatch = useDispatch()
    const links = useStreamToken({forStreamType: "breakoutRoom", targetBreakoutRoomId: id})

    const {isStreamer, isMainStreamer, isBreakout} = useCurrentStream()
    const {deleteBreakoutRoom, updateBreakoutRoom} = useFirebase()
    const {query: {livestreamId, breakoutRoomId}} = useRouter()
    const [editRoomNameModalOpen, setEditRoomNameModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleteBreakoutRoomModalOpen, setDeleteBreakoutRoomModalOpen] = useState(false);
    const [breakoutRoomLink, setBreakoutRoomLink] = useState("");
    const [joinAsMenuData, setJoinAsMenuData] = useState(initialJoinAsData);

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

    const handleOpenJoinAsMenu = (anchorEl, link, profile) => {
        setJoinAsMenuData({anchorEl, link, profile})
    }
    const handleCloseJoinAsMenu = (event) => {
        event?.stopPropagation()
        setJoinAsMenuData(initialJoinAsData)
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
        const streamerId = localStorage.getItem('streamingUuid')
        const prevProfile = liveSpeakers?.find(speaker => speaker.speakerUuid.replace(id, "") === streamerId)
        if (prevProfile) {
            handleOpenJoinAsMenu(event.currentTarget, breakoutRoomLink, prevProfile)
            return
        }
        return handleGoToRoom()
    }

    const handleGoToRoom = async (auto) => {
        if (!isBreakout) {
            await handleDisconnect()
        }
        handleClose()
        window.location.href = addQueryParam(breakoutRoomLink, auto ? "auto=true" : "")
    }

    const handleGoToRoomWithAutoProfile = (event) => {
        event.stopPropagation()
        handleCloseJoinAsMenu()
        return handleGoToRoom(true)
    }

    const handleGoToRoomWithNewProfile = (event) => {
        event.stopPropagation()
        handleCloseJoinAsMenu()
        return handleGoToRoom()
    }

    return (
        <React.Fragment>
            <Accordion
                onChange={handleChange(id)}
                expanded={openRoom === id}
                TransitionProps={{unmountOnExit: true}}
            >
                <AccordionSummary
                    className={clsx(classes.root, {
                        [classes.activeRoom]: id === breakoutRoomId
                    })}
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
                            <Grid item xs={mobile ? hasStarted?2: 3 : 2}>
                                <Chip
                                    label={
                                        <Typography variant="caption">
                                            {hasStarted ? "OPEN" : "CLOSED"}
                                        </Typography>
                                    }
                                    className={clsx(classes.status, {
                                        [classes.statusActive]: breakoutRoomId === id
                                    })}
                                    variant={breakoutRoomId === id ? "outlined" : "default"}
                                    title={hasStarted ? "OPEN" : "CLOSED"}
                                    color={hasStarted ? "primary" : "secondary"}
                                />
                            </Grid>
                            {hasStarted ? (
                                <RoomOpenedActions
                                    loading={loading}
                                    roomId={id}
                                    mobile={mobile}
                                    active={breakoutRoomId === id}
                                    joinAsMenuData={joinAsMenuData}
                                    handleGoToRoomWithAutoProfile={handleGoToRoomWithAutoProfile}
                                    handleGoToRoomWithNewProfile={handleGoToRoomWithNewProfile}
                                    handleCloseJoinAsMenu={handleCloseJoinAsMenu}
                                    isMainStreamer={isMainStreamer}
                                    handleJoinRoom={handleJoinRoom}
                                    handleCloseRoom={handleCloseRoom}
                                    handleClickRename={handleClickRename}
                                    breakoutRoomLink={breakoutRoomLink}
                                />
                            ) : (
                                <RoomClosedActions
                                    loading={loading}
                                    mobile={mobile}
                                    active={breakoutRoomId === id}
                                    isMainStreamer={isMainStreamer}
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
