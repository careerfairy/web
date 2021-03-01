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
import {FixedSizeList} from 'react-window'
import AutoSizer from "react-virtualized-auto-sizer";
import User from "./User";
import {ListSubheader, TextField, Typography} from "@material-ui/core";

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
    }
}));

function renderRow(props) {
    const { index, style } = props;

    return (
        <ListItem button style={style} key={index}>
            <ListItemText primary={`Item ${index + 1}`} />
        </ListItem>
    );
}

renderRow.propTypes = {
    index: PropTypes.number.isRequired,
    style: PropTypes.object.isRequired,
};
const AudienceDrawer = ({audienceDrawerOpen, hideAudience, livestreamId}) => {
    const classes = useStyles();

    const audience = useSelector(({firestore: {ordered}}) => ordered.audience || [])
    console.log("-> audience in AudienceDrawer", audience);

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
        <Drawer anchor="right" open={audienceDrawerOpen} onClose={hideAudience}>
            <div>
                {/*<div className={classes.titleWrapper}>*/}
                {/*    <Typography variant="h5">*/}
                {/*       */}
                {/*    </Typography>*/}
                {/*</div>*/}
                <TextField
                    fullWidth
                    label="Search for people..."
                />
                <ListSubheader>Members</ListSubheader>
                <AutoSizer>
                    {({height, width}) => (
                        <FixedSizeList itemSize={46} itemCount={audience.length} height={height} width={width} className={classes.list}>
                            {/*{audience.map(user => <User key={user.id} user={user}/>)}*/}
                            {renderRow}
                        </FixedSizeList>
                    )}
                </AutoSizer>
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

