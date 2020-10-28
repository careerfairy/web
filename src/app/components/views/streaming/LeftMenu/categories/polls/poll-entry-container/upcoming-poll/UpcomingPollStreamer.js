import React, {useState, useEffect, Fragment} from 'react';
import {Input, Icon, Dropdown} from "semantic-ui-react";
import EditIcon from '@material-ui/icons/Edit';
import {withFirebase} from 'context/firebase';
import PollCreationModal from '../../poll-creation-modal/PollCreationModal';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {Box, Button, IconButton, Menu, MenuItem} from "@material-ui/core";
import {CloseRounded} from "@material-ui/icons";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";


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

    const colors = ['red', 'orange', 'pink', 'olive'];
    const optionElements = props.poll.options.map((option, index) => {
        return (
            <Fragment key={index}>
                <div className='option-container'>
                    <div className='option-container-index' style={{backgroundColor: colors[index]}}>
                        <div>{index + 1}</div>
                    </div>
                    <div className='option-container-name'>
                        {option.name}
                    </div>
                </div>
                <style jsx>{`
                    .option-container-bar-element {
                        height: 15px;
                        margin: 0 0 8px 0;
                        border-top-left-radius: 1px;
                        border-top-right-radius: 5px;
                        border-bottom-left-radius: 1px;
                        border-bottom-right-radius: 5px;
                        box-shadow: 0 0 2px rgb(200,200,200);
                    }

                    .option-container {
                        margin: 10px 0;
                    }

                    .option-container div {
                        vertical-align: middle;
                    }

                    .option-container-index {
                        display: inline-block;
                        position: relative;
                        margin: 0 5px 0 0;
                        padding: 3px;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        font-size: 0.8em;
                    }

                    .option-container-index div {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: white;
                    }

                    .option-container-name {
                        display: inline-block;
                        margin: 0 0 0 5px;
                    }
                `}</style>
            </Fragment>
        );
    });

    return (
        <Fragment>
            <div className='animated fadeInUp faster overall' onMouseEnter={handleSetIsNotEditablePoll}
                 onMouseLeave={() => setShowNotEditableMessage(false)}>
                <div className='chat-entry-container'>
                    <Box p={2}>
                        <div className='poll-entry-message'>
                            {props.poll.question}
                        </div>
                        {optionElements}
                        <IconButton onClick={handleClick} style={{position: 'absolute', top: '15px', right: '20px', color: 'rgb(200,200,200)'}}>
                            <MoreVertIcon/>
                        </IconButton>
                        <Menu onClose={handleClose} anchorEl={anchorEl} open={Boolean(anchorEl)}>
                            <MenuItem onClick={() => setEditPoll(true)}>
                                <ListItemIcon>
                                    <EditIcon/>
                                </ListItemIcon>
                                <ListItemText primary="Edit"/>
                            </MenuItem>
                            <MenuItem onClick={() => deletePoll()}>
                                <ListItemIcon>
                                    <CloseRounded/>
                                </ListItemIcon>
                                <ListItemText primary="Delete"/>
                            </MenuItem>
                        </Menu>
                        {/*<Dropdown icon={{name: 'ellipsis vertical', fontSize: '1.1em', color: 'grey'}} direction='left'*/}
                        {/*          >*/}
                        {/*    <Dropdown.Menu>*/}
                        {/*        <Dropdown.Item*/}
                        {/*            icon='edit'*/}
                        {/*            text='Edit'*/}
                        {/*            onClick={() => setEditPoll(true)}*/}
                        {/*        />*/}
                        {/*        <Dropdown.Item*/}
                        {/*            icon='delete'*/}
                        {/*            text='Delete'*/}
                        {/*            onClick={() => deletePoll()}*/}
                        {/*        />*/}
                        {/*    </Dropdown.Menu>*/}
                        {/*</Dropdown>*/}
                    </Box>
                    <PollCreationModal livestreamId={props.livestream.id} initialPoll={props.poll} open={editPoll}
                                       onClose={() => setEditPoll(false)}/>

                    <Button fullWidth disableElevation attached='bottom' variant="contained" color="primary"
                            children={'Ask the Audience Now'} disabled={props.somePollIsCurrent}
                            onClick={() => setPollState('current')}
                            style={{borderRadius: '0 0 5px 5px'}}/>
                </div>
                <div className={'disabled-overlay ' + (showNotEditableMessage ? '' : 'hidden')}>
                    <div>
                        Please close the active poll before activating this one.
                    </div>
                </div>
            </div>
            <style jsx>{`
                .chat-entry-container {
                    border-radius: 5px;
                    box-shadow: 0 0 5px rgb(180,180,180);
                    margin: 10px 10px 0 10px;
                    padding-top: 40px;
                    background-color: white;
                }

                .overall {
                    position: relative;
                }

                .disabled-overlay {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    margin: 0 10px;
                    background-color: rgba(100,100,100,0.85);
                    border-radius: 5px;
                    z-index: 300;
                    cursor: pointer;
                }

                .disabled-overlay div {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    width: 70%;
                    color: white;
                    font-size: 1.2em;
                }

                .popup {
                    position: fixed;
                    bottom: 20px;
                    left: 300px;
                    width: 400px;
                    z-index: 9000;
                    padding: 30px;
                    border-radius: 10px;
                    background-color: white;
                }

                .popup .name {
                    font-size: 1.6em;
                    margin: 10px 0 30px 0;
                    font-weight: 700;
                    color: rgb(0, 210, 170);
                }

                .poll-entry-message {
                    font-weight: 700;
                    font-size: 1.4em;
                    margin: 10px 0 25px 0;
                }

                .chat-entry-author {
                    font-size: 0.8em;
                    color: rgb(180,180,180);
                }
            `}</style>
        </Fragment>
    );
}

export default withFirebase(UpcomingPollStreamer);