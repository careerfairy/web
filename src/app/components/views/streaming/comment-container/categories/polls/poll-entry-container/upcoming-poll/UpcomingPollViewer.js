import React, {useState, useEffect, Fragment} from 'react';
import {Input, Icon, Button, Dropdown} from "semantic-ui-react";
import Linkify from 'react-linkify';
import { withFirebase } from 'data/firebase';


function UpcomingPollViewer(props) {

    const colors = ['red', 'orange', 'pink', 'olive'];
    const optionElements = props.poll.options.map((option, index) => {
        return (
            <Fragment key={index}>
                <div className='option-container'>
                    <div className='option-container-index' style={{ backgroundColor: colors[index] }}>
                        <div>{ index + 1 }</div>       
                    </div>
                    <div className='option-container-name'>
                        { option.name }
                    </div>
                </div>
                <style jsx>{`
                    .option-container-bar-element {
                        height: 15px;
                        margin: 0 0 8px 0;
                        border-radius: 1px;
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
                <div className='animated fadeInUp faster'>
                    <div className='chat-entry-container'>
                        <div className='poll-entry-message'>
                            { props.poll.question }
                        </div>
                        { optionElements }
                    </div>           
                </div>   
                <style jsx>{`
                    .chat-entry-container {
                        border-radius: 5px;
                        box-shadow: 0 0 5px rgb(180,180,180);
                        margin: 10px 10px 0 10px;
                        padding: 40px 20px 20px 20px;
                        background-color: white;
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

export default withFirebase(UpcomingPollViewer);