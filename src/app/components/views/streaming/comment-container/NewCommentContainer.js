
import React, {useState, useEffect, Fragment} from 'react';
import {Input, Icon, Button, Label, Grid} from "semantic-ui-react";

import { withFirebase } from 'context/firebase';
import QuestionCategory from './categories/QuestionCategory';
import PollCategory from './categories/PollCategory';
import HandRaiseCategory from './categories/HandRaiseCategory';
import {ButtonComponent} from "../../viewer/comment-container/ButtonComponent";

function CommentContainer(props) {

    const [selectedState, setSelectedState] = useState("questions");

    useEffect(() => {
        if (!typeof window === 'object') {
          return false;
        }
        
        function handleResize() {
            if (window.innerWidth < 996) {
                props.setShowMenu(false);
            }
            if (window.innerWidth > 1248) {
                props.setShowMenu(true);
            }
        }
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);

    function handleStateChange(state) {
        if (!props.showMenu) {
            props.setShowMenu(true);
        }
        setSelectedState(state);
    }


    if (!props.showMenu) {
        return (
            <Fragment>
                <ButtonComponent selectedState={selectedState}  handleStateChange={handleStateChange} {...props}/>
            </Fragment>
        );
    }

    return (
        <div className='interaction-container'>
            <div className='interaction-category'>
                <QuestionCategory livestream={props.livestream} selectedState={selectedState} user={props.user} userData={props.userData}/>
                <PollCategory livestream={props.livestream} selectedState={selectedState} streamer={props.streamer} user={props.user} userData={props.userData}/>
                <HandRaiseCategory livestream={props.livestream} selectedState={selectedState} user={props.user} userData={props.userData}  handRaiseActive={props.handRaiseActive} setHandRaiseActive={props.setHandRaiseActive}/>
            </div>
            <ButtonComponent selectedState={selectedState}  handleStateChange={handleStateChange} {...props}/>
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