import React, {useState} from "react";
import Box from "@material-ui/core/Box";
import {IconButton, ListItemIcon, Menu, MenuItem, Typography} from "@material-ui/core";
import MoreOptionsIcon from "@material-ui/icons/MoreHoriz";
import AnnouncementIcon from "@material-ui/icons/ContactlessOutlined";
import BackToMainRoomIcon from "@material-ui/icons/ArrowBackIos";
import RoomSettingsIcon from '@material-ui/icons/Settings';
import AddRoomIcon from '@material-ui/icons/AddCircleOutline';
import AnnouncementModal from "./AnnouncementModal";
import PropTypes from "prop-types";
import {useRouter} from "next/router";
import {makeStyles} from "@material-ui/core/styles";
import AddRoomModal from "./AddRoomModal";

const useStyles = makeStyles(theme => ({
    menuIconRoot: {
        minWidth: theme.spacing(4)
    }
}));

const BreakoutRoomOptions = (
    {
        handleBackToMainRoom,
        openSettings,
    }) => {
    const {query: {breakoutRoomId}} = useRouter()
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

    return (
        <React.Fragment>
            <Box py={2} px={1.5}>
                <IconButton onClick={handleClickMoreOptions}>
                    <MoreOptionsIcon/>
                </IconButton>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMoreOptions}
                >
                    <MenuItem onClick={handleOpenAnnouncementModal}>
                        <ListItemIcon classes={{root: classes.menuIconRoot}}>
                            <AnnouncementIcon/>
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            Make an Announcement
                        </Typography>
                    </MenuItem>
                    {breakoutRoomId &&
                    <MenuItem
                        onClick={handleBackToMainRoom}
                    >
                        <ListItemIcon classes={{root: classes.menuIconRoot}}>
                            <BackToMainRoomIcon/>
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            Back to main Room
                        </Typography>
                    </MenuItem>}
                    <MenuItem onClick={handleOpenAddRoomModal}>
                        <ListItemIcon classes={{root: classes.menuIconRoot}}>
                            <AddRoomIcon />
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            Add Room
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
    handleBackToMainRoom: PropTypes.func,
    openSettings: PropTypes.func
};

export default BreakoutRoomOptions