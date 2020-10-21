import React, {useState, useEffect, Fragment} from 'react';
import {Input, Icon, Button, Label, Grid} from "semantic-ui-react";

import ChatCategory from 'components/views/streaming/comment-container/categories/ChatCategory';
import QuestionCategory from './categories/QuestionCategory';
import PollCategory from './categories/PollCategory';
import HandRaiseCategory from './categories/HandRaiseCategory';
import {useWindowSize} from 'components/custom-hook/useWindowSize';
import {ButtonComponent} from "./ButtonComponent";




function CommentContainer(props) {

    const [selectedState, setSelectedState] = useState("questions");
    const [isMobile, setIsMobile] = useState(false);
    const {width, height} = useWindowSize();

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
    }, [width])


    if (!props.showMenu) {
        return (
            <Fragment>
                <ButtonComponent isMobile={isMobile} handleStateChange={handleStateChange} {...props}/>
            </Fragment>
        );
    }

    return (
        <div className='interaction-container'>
            <div className='close-menu'>
                <Button circular size='big' icon='angle left' color='pink' onClick={() => {
                    props.setShowMenu(!props.showMenu)
                }}/>
            </div>
            <div className='interaction-category'>
                <ChatCategory livestream={props.livestream} selectedState={selectedState} user={props.user}
                              userData={props.userData} isStreamer={false}/>
                <QuestionCategory livestream={props.livestream} selectedState={selectedState} user={props.user}
                                  userData={props.userData}/>
                <PollCategory livestream={props.livestream} selectedState={selectedState}
                              setSelectedState={setSelectedState} setShowMenu={props.setShowMenu}
                              streamer={props.streamer} user={props.user} userData={props.userData}/>
                <HandRaiseCategory livestream={props.livestream} selectedState={selectedState} user={props.user}
                                   userData={props.userData} handRaiseActive={props.handRaiseActive}
                                   setHandRaiseActive={props.setHandRaiseActive}/>
            </div>
            <ButtonComponent selectedState={selectedState} handleStateChange={handleStateChange} isMobile={isMobile} {...props}/>
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