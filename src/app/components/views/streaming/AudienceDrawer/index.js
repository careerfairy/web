import PropTypes from 'prop-types'
import React from 'react';
import clsx from 'clsx';
import {makeStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import {useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import User from "./User";
import {Typography} from "@material-ui/core";

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
        position: "fixed",
        height: 40,
        zIndex:1,
        background: theme.palette.background.paper,
        width: "100%"
    }
}));

const AudienceDrawer = ({audienceDrawerOpen, hideAudience, livestreamId}) => {
    const classes = useStyles();

    useFirestoreConnect(() => [
        {
            collection: "livestreams",
            doc: livestreamId,
            subcollections: [
                {
                    collection: "participatingStudents",
                    // orderBy: ["joined", "asc"],
                }
            ],
            storeAs: "audience"
        }
    ])

    const audience = useSelector(({firestore: {ordered}}) => ordered.audience || [])
    console.log("-> audience", audience);

    const list = (anchor) => (
        <div
            className={clsx(classes.list, {
                [classes.fullList]: anchor === 'top' || anchor === 'bottom',
            })}
            role="presentation"
        >
            <List>
                {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                    <ListItem button key={text}>
                        <ListItemIcon>{index % 2 === 0 ? <InboxIcon/> : <MailIcon/>}</ListItemIcon>
                        <ListItemText primary={text}/>
                    </ListItem>
                ))}
            </List>
            <Divider/>
            <List>
                {['All mail', 'Trash', 'Spam'].map((text, index) => (
                    <ListItem button key={text}>
                        <ListItemIcon>{index % 2 === 0 ? <InboxIcon/> : <MailIcon/>}</ListItemIcon>
                        <ListItemText primary={text}/>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <React.Fragment>
            <Drawer anchor="right" open={audienceDrawerOpen} onClose={hideAudience}>
                {/*{list("right")}*/}
                <div className={classes.titleWrapper}>
                    <Typography variant="h5">
                        Members
                    </Typography>
                </div>
                <List className={classes.list}>
                    {audience.map(user => <User key={user.id} user={user}/>)}
                </List>
            </Drawer>
        </React.Fragment>
    );
}

AudienceDrawer.propTypes = {
    audienceDrawerOpen: PropTypes.bool.isRequired,
    hideAudience: PropTypes.func.isRequired,
    livestreamId: PropTypes.string.isRequired
}

export default AudienceDrawer

