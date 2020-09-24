import React, {useState, useEffect, Fragment} from 'react';
import {Input, Icon, Button, Label, Grid} from "semantic-ui-react";

import ChatCategory from 'components/views/streaming/comment-container/categories/ChatCategory';
import QuestionCategory from './categories/QuestionCategory';
import PollCategory from './categories/PollCategory';
import HandRaiseCategory from './categories/HandRaiseCategory';
import { useWindowSize } from 'components/custom-hook/useWindowSize';

function CommentContainer(props) {

    const [selectedState, setSelectedState] = useState("questions");
    const [isMobile, setIsMobile] = useState(false);
    const { width, height } = useWindowSize();

    function handleStateChange(state) {
        if (!props.showMenu) {
            props.setShowMenu(true);
        }
        setSelectedState(state);
    }

    useEffect(() => {
        if (width < 768) {
            setIsMobile(true);
        } else {
            setIsMobile(false);
        }
    },[width])

    const ButtonComponent = (props) => {

        if (isMobile && props.showMenu) {
            return null;
        }

        return (
            <Fragment>
                <div className='interaction-selector'>
                    <div className='interaction-selectors'>
                        {
                            isMobile ? 
                            <div>
                                <Button circular size='big' icon='comments outline' disabled={props.showMenu && selectedState === 'chat'} onClick={() => props.handleStateChange("chat")} color='teal'/>
                                <span onClick={() => props.handleStateChange("chat")}>Chat</span>
                            </div> : 
                            null
                        }     
                        <div>
                            <Button circular size='big' icon='question circle outline' disabled={props.showMenu && selectedState === 'questions'} onClick={() => props.handleStateChange("questions")} color='teal'/>
                            <span onClick={() => props.handleStateChange("questions")}>Q&A</span>
                        </div>
                        <div>
                            <Button circular size='big' icon='chart bar outline' disabled={props.showMenu && selectedState === 'polls'} onClick={() => props.handleStateChange("polls")} color='teal'/>
                            <span onClick={() => props.handleStateChange("polls")}>Polls</span>
                        </div>
                        {
                        !isMobile ? 
                        <div>
                            <Button circular size='big' icon='hand pointer outline' disabled={props.showMenu && selectedState === 'hand'} onClick={() => props.handleStateChange("hand")} color='teal'/>
                            <span onClick={() => props.handleStateChange("hand")}>Hand Raise</span>
                        </div> : 
                            null
                        }     
                        {/* <div>
                            <Button circular size='big' icon='cog' onClick={() => props.setShowMenu(!props.showMenu)} secondary/>
                            <span style={{ opacity: showLabels ? '1' : '0' }} onClick={() => props.handleStateChange("settings")}>Settings</span>
                        </div> */}
                        {/* <div className={ props.showMenu ? '' : 'hidden' }>
                            <Button circular size='big' icon={'angle left'} onClick={() => props.setShowMenu(!props.showMenu)}/>
                        </div> */}
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
            <div className='close-menu'>
                <Button circular size='big' icon='angle left' color='pink' onClick={() => {props.setShowMenu(!props.showMenu)}}/>
            </div>
            <div className='interaction-category'>
                <ChatCategory livestream={props.livestream} selectedState={selectedState} user={props.user} userData={props.userData} isStreamer={false}/>
                <QuestionCategory livestream={props.livestream} selectedState={selectedState} user={props.user} userData={props.userData}/>
                <PollCategory livestream={props.livestream} selectedState={selectedState} setSelectedState={setSelectedState} setShowMenu={props.setShowMenu} streamer={props.streamer} user={props.user} userData={props.userData}/>
                <HandRaiseCategory livestream={props.livestream} selectedState={selectedState} user={props.user} userData={props.userData}  handRaiseActive={props.handRaiseActive} setHandRaiseActive={props.setHandRaiseActive}/>
            </div>
            <ButtonComponent handleStateChange={handleStateChange} {...props}/>
            <style jsx>{`
                .interaction-container {
                    position: relative;
                    height: 100%;
                    width: 100%;
                }

                .interaction-category {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 0;
                    bottom: 0;
                }

                .close-menu {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    text-align: center;
                    z-index: 9100;
                }

                @media(min-width: 768px) {
                    .close-menu {
                        display: none;
                    }
                }
          `}</style>
        </div>
    );
}

export default CommentContainer;