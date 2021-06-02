import PropTypes from 'prop-types'
import React, {useState} from "react";
import Box from "@material-ui/core/Box";
import {IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography} from "@material-ui/core";
import MoreOptionsIcon from "@material-ui/icons/MoreHoriz";
import AnnouncementIcon from "@material-ui/icons/ContactlessOutlined";
import RoomSettingsIcon from '@material-ui/icons/Settings';
import AddRoomIcon from '@material-ui/icons/AddCircleOutline';
import RefreshRoomsIcon from '@material-ui/icons/Refresh';
import AnnouncementModal from "./AnnouncementModal";
import {makeStyles} from "@material-ui/core/styles";
import AddRoomModal from "./AddRoomModal";
import {MAX_BREAKOUT_ROOMS} from "constants/breakoutRooms";

const useStyles = makeStyles(theme => ({
    menuIconRoot: {
        minWidth: theme.spacing(4)
    }
}));

const BreakoutRoomOptions = (
    {
        openSettings,
        handleRefresh,
        loading,
        mobile,
        numberOfRooms
    }) => {
    const classes = useStyles()

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
    const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);


    const handleOpenAnnouncementModal = () => {
        handleCloseMoreOptions()
        setAnnouncementModalOpen(true)
    }

    const handleCloseAnnouncementModal = () => {
        setAnnouncementModalOpen(false)
    }

    const handleClickMoreOptions = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMoreOptions = () => {
        setAnchorEl(null);
    };

    const handleCloseAddRoomModal = () => {
        handleCloseMoreOptions()
        setAddRoomModalOpen(false)
    }
    const handleOpenAddRoomModal = () => {
        handleCloseMoreOptions()
        setAddRoomModalOpen(true)
    }

    const handleClickRefresh = async () => {
        await handleRefresh()
        handleCloseMoreOptions()
    }

    return (
        <React.Fragment>
            <Box py={2} px={1}>
                <IconButton size={mobile ? "small" : "medium"} onClick={handleClickMoreOptions}>
                    <MoreOptionsIcon/>
                </IconButton>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMoreOptions}
                >
                    <Tooltip title="Send a broadcast message to all breakout rooms">
                        <MenuItem onClick={handleOpenAnnouncementModal}>
                            <ListItemIcon classes={{root: classes.menuIconRoot}}>
                                <AnnouncementIcon/>
                            </ListItemIcon>
                            <Typography variant="inherit" noWrap>
                                Broadcast a message
                            </Typography>
                        </MenuItem>
                    </Tooltip>
                    <MenuItem disabled={numberOfRooms >= MAX_BREAKOUT_ROOMS} onClick={handleOpenAddRoomModal}>
                        <ListItemIcon classes={{root: classes.menuIconRoot}}>
                            <AddRoomIcon/>
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            {numberOfRooms >= MAX_BREAKOUT_ROOMS ? "Maximum amount of rooms reached" : "Add Room"}
                        </Typography>
                    </MenuItem>
                    <MenuItem disabled={loading} onClick={handleClickRefresh}>
                        <ListItemIcon classes={{root: classes.menuIconRoot}}>
                            <RefreshRoomsIcon/>
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            Refresh
                        </Typography>
                    </MenuItem>
                    <MenuItem onClick={openSettings}>
                        <ListItemIcon classes={{root: classes.menuIconRoot}}>
                            <RoomSettingsIcon/>
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            Settings
                        </Typography>
                    </MenuItem>
                </Menu>
            </Box>
            <AnnouncementModal
                open={announcementModalOpen}
                onClose={handleCloseAnnouncementModal}
            />
            <AddRoomModal
                open={addRoomModalOpen}
                onClose={handleCloseAddRoomModal}
            />
        </React.Fragment>
    );
};

BreakoutRoomOptions.propTypes = {
    handleRefresh: PropTypes.func,
    loading: PropTypes.bool,
    mobile: PropTypes.object,
    numberOfRooms: PropTypes.number,
    openSettings: PropTypes.func
}

export default BreakoutRoomOptions