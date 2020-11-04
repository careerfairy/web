import React, {useState, Fragment, useContext} from 'react';
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
import TutorialContext from "../../../../../../../../context/tutorials/TutorialContext";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "../../../../../../../../materialUI/GlobalTooltips";
import {
    CategoryContainerTopAligned,
    QuestionContainerHeader
} from "../../../../../../../../materialUI/GlobalContainers";

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

function UpcomingPollStreamer({firebase, sliding, somePollIsCurrent, livestream, poll, showMenu, selectedState, index, setDemoPolls, addNewPoll}) {

    const [editPoll, setEditPoll] = useState(false);
    const [showNotEditableMessage, setShowNotEditableMessage] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const {tutorialSteps, setTutorialSteps} = useContext(TutorialContext);

    const isOpen = (property) => {
        return Boolean(livestream.test && index === 0
            && showMenu && tutorialSteps.streamerReady
            && tutorialSteps[property]
            && selectedState === "polls"
            && !addNewPoll
            && !sliding
        )
    }

    const handleConfirm = (property) => {
        setTutorialSteps({
            ...tutorialSteps,
            [property]: false,
            [property + 1]: true,
        })
    }


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
        firebase.deleteLivestreamPoll(livestream.id, poll.id);
    }

    function setPollState(state) {
        firebase.setPollState(livestream.id, poll.id, state);
    }

    function handleSetIsNotEditablePoll() {
        if (somePollIsCurrent) {
            setShowNotEditableMessage(true);
        }
    }


    let totalVotes = 0;
    poll.options.forEach(option => totalVotes += option.votes);


    const optionElements = poll.options.map((option, index) => {
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
        <WhiteTooltip
            placement="right-start"
            title={
                <React.Fragment>
                    <TooltipTitle>Polls (2/3)</TooltipTitle>
                    <TooltipText>
                        All your created polls will be stored here
                    </TooltipText>
                    <TooltipButtonComponent onConfirm={() => handleConfirm(5)} buttonText="Ok"/>
                </React.Fragment>
            } open={isOpen(5)}>
            <Paper style={{margin: 10, position: "relative"}} onMouseEnter={handleSetIsNotEditablePoll}
                   onMouseLeave={() => setShowNotEditableMessage(false)}>
                <Box p={2}>
                    <Typography gutterBottom variant="h6" style={{margin: "1.5rem 0 0.5rem 0"}}>
                        {poll.question}
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
                <WhiteTooltip
                    placement="right-start"
                    title={
                        <React.Fragment>
                            <TooltipTitle>Polls (3/3)</TooltipTitle>
                            <TooltipText>
                                Once you are ready, click here to ask the audience
                            </TooltipText>
                            <TooltipButtonComponent onConfirm={() => {
                                setDemoPolls(true)
                                setPollState('current')
                                handleConfirm(6)
                            }} buttonText="Ok"/>
                        </React.Fragment>
                    } open={isOpen(6)}>
                    <Button fullWidth disableElevation variant="contained" color="primary"
                            children={'Ask the Audience Now'} disabled={somePollIsCurrent}
                            onClick={() => {
                                if (isOpen(6)) {
                                    handleConfirm(6)
                                    setDemoPolls(true)
                                }
                                setPollState('current')
                            }}
                            style={{borderRadius: '0 0 5px 5px'}}/>
                </WhiteTooltip>
                {showNotEditableMessage && <Overlay>
                    <div>
                        Please close the active poll before activating this one.
                    </div>
                </Overlay>}
                <PollCreationModal livestreamId={livestream.id} initialPoll={poll} open={editPoll}
                                   handleClose={() => setEditPoll(false)}/>
            </Paper>
        </WhiteTooltip>
    );
}

export default withFirebase(UpcomingPollStreamer);