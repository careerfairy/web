import PropTypes from 'prop-types'
import React from 'react';
import {fade, makeStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import UsersTab from "./UsersTab";

const useStyles = makeStyles(theme => ({
    drawerContent: {
        height: "100%",
        display: "flex",
        backgroundColor: fade(theme.palette.common.black, 0.1),
        backdropFilter: "blur(5px)",
        flexDirection: "column",
        [theme.breakpoints.down("sm")]: {
            minWidth: "100vw"
        },
        [theme.breakpoints.up("sm")]: {
            minWidth: 400,
        }
    },

}));


const AudienceDrawer = ({audienceDrawerOpen, hideAudience, livestreamId}) => {
    const classes = useStyles();

    return (
        <Drawer
            PaperProps={{
                className: classes.drawerContent
            }}
            anchor="right"
            open={audienceDrawerOpen}
            onClose={hideAudience}>
            <UsersTab/>
        </Drawer>
    );
}

AudienceDrawer.propTypes = {
    audienceDrawerOpen: PropTypes.bool.isRequired,
    hideAudience: PropTypes.func.isRequired,
    livestreamId: PropTypes.string.isRequired
}

export default AudienceDrawer

