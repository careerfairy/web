import React, {useState, useEffect, Fragment} from 'react';
import {Input, Icon, Button, Label, Grid} from "semantic-ui-react";

import { withFirebase } from '../../../../context/firebase';
import QuestionCategory from './categories/QuestionCategory';
import ChatCategory from './categories/ChatCategory';
import PollCategory from './categories/PollCategory';
import HandRaiseCategory from './categories/HandRaiseCategory';

function CommentContainer(props) {

    const [selectedState, setSelectedState] = useState("hand");

    function handleStateChange(state) {
        if (!props.showMenu) {
            props.setShowMenu(true);
        }
        setSelectedState(state);
    }

    const ButtonComponent = (props) => {

        const [showLabels, setShowLabels] = useState(true);

        return (
            <Fragment>
                <div className='interaction-selector' onMouseEnter={() => setShowLabels(true)}>
                    <div className='interaction-selectors'>
                        <div>
                            <Button circular size='big' icon='comments outline' disabled={props.showMenu && selectedState === 'chat'} onClick={() => props.handleStateChange("chat")} primary/>
                            <span style={{ opacity: props.showMenu ? '0' : '1' }} onClick={() => props.handleStateChange("chat")}>Main Chat</span>
                        </div>
                        <div>
                            <Button circular size='big' icon='question circle outline' disabled={props.showMenu && selectedState === 'questions'} onClick={() => props.handleStateChange("questions")} primary/>
                            <span style={{ opacity: props.showMenu ? '0' : '1' }} onClick={() => props.handleStateChange("questions")}>Q&A</span>
                        </div>
                        <div>
                            <Button circular size='big' icon='chart bar outline' disabled={props.showMenu && selectedState === 'polls'} onClick={() => props.handleStateChange("polls")} primary/>
                            <span style={{ opacity: props.showMenu ? '0' : '1' }} onClick={() => props.handleStateChange("polls")}>Polls</span>
                        </div>
                        <div>
                            <Button circular size='big' icon='hand pointer outline' disabled={props.showMenu && selectedState === 'hand'} onClick={() => props.handleStateChange("hand")} primary/>
                            <span style={{ opacity: props.showMenu ? '0' : '1' }} onClick={() => props.handleStateChange("hand")}>Hand Raise</span>
                        </div>
                        <div>
                            <Button circular size='big' icon='cog' onClick={() => props.setShowMenu(!props.showMenu)} secondary/>
                            <span style={{ opacity: props.showMenu ? '0' : '1' }} onClick={() => props.handleStateChange("settings")}>Settings</span>
                        </div>
                        <div className={ props.showMenu ? '' : 'hidden' }>
                            <Button circular size='big' icon={'angle left'} onClick={() => props.setShowMenu(!props.showMenu)} color='pink'/>
                        </div>
                    </div>
                </div>
                <style jsx>{`
                    .hidden {
                        display: none;
                    }

                    .interaction-selector {
                        position: absolute;
                        right: -200px;
                        top: 50%;
                        transform: translateY(-50%);
                        height: 100%;
                        cursor: pointer;
                        width: 200px;
                        background: linear-gradient(90deg, rgba(42,42,42,1) 0%, rgba(60,60,60,0) 100%);
                    }

                    .interaction-selectors {
                        position: absolute;
                        right: 0;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 100%;
                        padding: 20px;
                    }

                    .interaction-selector div {
                        margin: 0 0 15px 0;
                    }

                    .interaction-selector span {
                        color: white;
                        margin-left: 10px;
                        font-weight: 600;
                    }
                `}</style>
            </Fragment>
        )
    }

    if (!props.showMenu) {
        return (
            <Fragment>
                <ButtonComponent handleStateChange={handleStateChange} {...props}/>
            </Fragment>
        );
    }

    return (
        <div className='interaction-container'>
            <div className='interaction-category'>
                <ChatCategory livestream={props.livestream} selectedState={selectedState} user={props.user} userData={props.userData}/>
                <QuestionCategory livestream={props.livestream} selectedState={selectedState} user={props.user} userData={props.userData}/>
                <PollCategory livestream={props.livestream} selectedState={selectedState} streamer={props.streamer} user={props.user} userData={props.userData}/>
                <HandRaiseCategory livestream={props.livestream} selectedState={selectedState} user={props.user} userData={props.userData}  handRaiseActive={props.handRaiseActive} setHandRaiseActive={props.setHandRaiseActive}/>
            </div>
            <ButtonComponent handleStateChange={handleStateChange} {...props}/>
            <style jsx>{`
                .interaction-category {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 0;
                    bottom: 0;
                }
          `}</style>
        </div>
    );
}

export default withFirebase(CommentContainer);