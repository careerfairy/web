import React, {useState, Fragment} from 'react';
import EditIcon from '@material-ui/icons/Edit';
import {withFirebase} from 'context/firebase';
import PollCreationModal from '../../poll-creation-modal/PollCreationModal';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {Box, Button, Chip, IconButton, List, ListItem, Menu, MenuItem, Typography, withStyles} from "@material-ui/core";
import {CloseRounded} from "@material-ui/icons";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import {colorsArray} from "../../../../../../../util/colors";

const Overlay = withStyles(theme => ({
    root: {
        position: "absolute",
        height: "100%",
        top: 0,
        Bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(100,100,100,0.85)",
        zIndex: 300,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        "& div": {
            textAlign: "center",
            width: "70%",
            color: "white",
            fontSize: "1.2em",
        }
    }
}))(Paper)

const ListNumber = withStyles(theme => ({
    root: {
        color: "white",
        borderRadius: "50%",
        width: 20,
        height: 20,
        display: "grid",
        placeItems: "center",
    }
}))(Box)

function UpcomingPollStreamer(props) {

    const [editPoll, setEditPoll] = useState(false);
    const [showNotEditableMessage, setShowNotEditableMessage] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpenPollModal = () => {
        setEditPoll(true)
        handleClose()
    }

    function deletePoll() {
        props.firebase.deleteLivestreamPoll(props.livestream.id, props.poll.id);
    }

    function setPollState(state) {
        props.firebase.setPollState(props.livestream.id, props.poll.id, state);
    }

    function handleSetIsNotEditablePoll() {
        if (props.somePollIsCurrent) {
            setShowNotEditableMessage(true);
        }
    }


    let totalVotes = 0;
    props.poll.options.forEach(option => totalVotes += option.votes);

    const optionElements = props.poll.options.map((option, index) => {
        return (
            <ListItem disableGutters dense key={index}>
                <ListItemIcon>
                    <ListNumber style={{backgroundColor: colorsArray[index]}}>
                        {index + 1}
                    </ListNumber>
                </ListItemIcon>
                <ListItemText>
                    {option.name}
                </ListItemText>
            </ListItem>
        )
    });

    return (
        <Paper style={{margin: 10, position: "relative"}} onMouseEnter={handleSetIsNotEditablePoll}
               onMouseLeave={() => setShowNotEditableMessage(false)}>
            <Box p={2}>
                <Typography gutterBottom variant="h6" style={{ margin: "1.5rem 0 0.5rem 0"}}>
                    {props.poll.question}
                </Typography>
                <List dense>
                    {optionElements}
                </List>
                <IconButton size="small" onClick={handleClick} style={{
                    position: 'absolute',
                    top: 5,
                    right: 0,
                    color: 'rgb(200,200,200)',
                    zIndex: 301
                }}>
                    <MoreVertIcon/>
                </IconButton>
                <Menu onClose={handleClose} anchorEl={anchorEl} open={Boolean(anchorEl)}>
                    <MenuItem dense onClick={handleOpenPollModal}>
                        <ListItemIcon>
                            <EditIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Edit"/>
                    </MenuItem>
                    <MenuItem dense onClick={deletePoll}>
                        <ListItemIcon>
                            <CloseRounded/>
                        </ListItemIcon>
                        <ListItemText primary="Delete"/>
                    </MenuItem>
                </Menu>
            </Box>
            <Button fullWidth disableElevation variant="contained" color="primary"
                    children={'Ask the Audience Now'} disabled={props.somePollIsCurrent}
                    onClick={() => setPollState('current')}
                    style={{borderRadius: '0 0 5px 5px'}}/>
            {showNotEditableMessage && <Overlay>
                <div>
                    Please close the active poll before activating this one.
                </div>
            </Overlay>}
            <PollCreationModal livestreamId={props.livestream.id} initialPoll={props.poll} open={editPoll}
                               handleClose={() => setEditPoll(false)}/>
        </Paper>
    );
}

export default withFirebase(UpcomingPollStreamer);