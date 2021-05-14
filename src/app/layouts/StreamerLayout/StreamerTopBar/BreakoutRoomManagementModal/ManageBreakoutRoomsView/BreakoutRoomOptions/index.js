import React from "react";
import Box from "@material-ui/core/Box";
import {IconButton, ListItemIcon, Menu, MenuItem, Typography} from "@material-ui/core";
import MoreOptionsIcon from "@material-ui/icons/MoreHoriz";
import AnnouncementIcon from "@material-ui/icons/ContactlessOutlined";
import BackToMainRoomIcon from "@material-ui/icons/ArrowBackIos";
import AnnouncementModal from "../AnnouncementModal";
import PropTypes from "prop-types";

const BreakoutRoomOptions = ({
                                 anchorEl,
                                 breakoutRoomId,
                                 onClick,
                                 handleOpenAnnouncementModal,
                                 handleBackToMainRoom,
                                 onClose,
                                 announcementModalOpen,
                                 handleCloseAnnouncementModal
                             }) => {

    return (
        <React.Fragment>
            <Box py={2} px={1.5}>
                <IconButton onClick={onClick}>
                    <MoreOptionsIcon/>
                </IconButton>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={onClose}
                >
                    <MenuItem onClick={handleOpenAnnouncementModal}>
                        <ListItemIcon>
                            <AnnouncementIcon/>
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            Make an Announcement
                        </Typography>
                    </MenuItem>
                    <MenuItem onClick={onClose}>My account</MenuItem>
                    {breakoutRoomId &&
                    <MenuItem
                        onClick={handleBackToMainRoom}
                    >
                        <ListItemIcon>
                            <BackToMainRoomIcon/>
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            Back to main Room
                        </Typography>
                    </MenuItem>}
                </Menu>
            </Box>
            <AnnouncementModal
                open={announcementModalOpen}
                onClose={handleCloseAnnouncementModal}
            />
        </React.Fragment>
    );
};

BreakoutRoomOptions.propTypes = {
    onClick: PropTypes.func,
    anchorEl: PropTypes.any,
    onClose: PropTypes.func,
    handleOpenAnnouncementModal: PropTypes.func,
    breakoutRoomId: PropTypes.any,
    handleBackToMainRoom: PropTypes.func
};

export default BreakoutRoomOptions