import PropTypes from 'prop-types'
import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import {useSelector} from "react-redux";
import {TextField} from "@material-ui/core";
import UserList from "./UserList";

const useStyles = makeStyles(theme => ({
    list: {
        // width: 250,
        paddingTop: 40
    },
    fullList: {
        width: 'auto',
    },
    titleWrapper: {
        padding: theme.spacing(2),
        position: "sticky",
        height: 40,
        zIndex: 1,
        background: theme.palette.background.paper,
        width: "100%"
    },
    drawerHeader: {
        padding: theme.spacing(1, 1, 0, 1)
    }
}));


const AudienceDrawer = ({audienceDrawerOpen, hideAudience, livestreamId}) => {
    const classes = useStyles();

    const audience = useSelector(({firestore: {ordered}}) => ordered.audience || [])
    const [searchParams, setSearchParams] = useState("");

    // console.log("-> audience in AudienceDrawer", audience);

    return (
        <Drawer anchor="right" open={audienceDrawerOpen} onClose={hideAudience}>
            <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
                <div className={classes.drawerHeader}>
                    <TextField
                        fullWidth
                        value={searchParams}
                        onChange={(e) => setSearchParams(e.currentTarget.value)}
                        label="Search for people..."
                    />
                </div>
                <UserList audience={audience}/>
            </div>
        </Drawer>
    );
}

AudienceDrawer.propTypes = {
    audienceDrawerOpen: PropTypes.bool.isRequired,
    hideAudience: PropTypes.func.isRequired,
    livestreamId: PropTypes.string.isRequired
}

export default AudienceDrawer

