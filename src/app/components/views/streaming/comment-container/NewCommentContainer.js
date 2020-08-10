import React, {useState} from 'react';
import {Input, Icon, Button, Label, Grid} from "semantic-ui-react";

import { withFirebase } from '../../../../data/firebase';
import QuestionCategory from './categories/QuestionCategory';
import ChatCategory from './categories/ChatCategory';
import PollCategory from './categories/PollCategory';

function CommentContainer(props) {

    const [selectedState, setSelectedState] = useState("polls");

    return (
        <div>
            <div className='interaction-category'>
                <ChatCategory livestream={props.livestream} selectedState={selectedState} user={props.user} userData={props.userData}/>
                <QuestionCategory livestream={props.livestream} selectedState={selectedState} user={props.user} userData={props.userData}/>
                <PollCategory livestream={props.livestream} selectedState={selectedState} streamer={props.streamer} user={props.user} userData={props.userData}/>
            </div>
            <div className='interaction-selector'>
                <Grid className='middle aligned' textAlign='center' style={{ padding: '0', margin: '0', height: '100%' }}>
                    <Grid.Column width={4}>
                        <Icon name='comments outline' onClick={() => setSelectedState("chat")} style={{ fontSize: '1.5em', color: 'rgb(180,180,180)', cursor: 'pointer'}}/>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <Icon name='question circle outline' onClick={() => setSelectedState("questions")} style={{ fontSize: '1.5em', color: 'rgb(180,180,180)', cursor: 'pointer'}}/>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <Icon name='chart bar outline' onClick={() => setSelectedState("polls")} style={{ fontSize: '1.5em', color: 'rgb(180,180,180)', cursor: 'pointer'}}/>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <Icon name='video' onClick={() => setSelectedState("video")} style={{ fontSize: '1.5em', color: 'rgb(180,180,180)', cursor: 'pointer'}}/>
                    </Grid.Column>
                </Grid>
            </div>
            <style jsx>{`
                .interaction-category {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 0;
                    bottom: 60px;
                }
                .interaction-selector {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    height: 60px;
                    background-color: white;
                    width: 100%;
                    box-shadow: 2px 0 5px rgb(200,200,200);
                }
          `}</style>
        </div>
    );
}

export default withFirebase(CommentContainer);