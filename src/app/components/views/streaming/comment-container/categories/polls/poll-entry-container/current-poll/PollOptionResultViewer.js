import React, {useState, useEffect, Fragment} from 'react';
import {Input, Icon, Button, Dropdown} from "semantic-ui-react";
import { withFirebase } from 'context/firebase';


function PollOptionResultViewer(props) {
    const colors = ['red', 'orange', 'pink', 'olive'];

    function getBarWidth(votes) {
        if (!votes || votes === 0) {
            return '5px';
        } else {
            return (votes / props.totalVotes) * 100 + '%';
        }
    }
    
    return (
        <Fragment key={props.index}>
            <div className='option-container'>
                <div>
                    <div className='option-container-bar-element' style={{ backgroundColor: colors[props.index], width: getBarWidth(props.option.votes) }}></div>
                </div>
                <div className='option-container-label'>
                    <div className='option-container-index' style={{ backgroundColor: colors[props.index] }}>
                        <div>{ props.index + 1 }</div>       
                    </div>
                    <div className='option-container-name'>
                        { props.option.name } <span className='option-container-name-votes'>[{ props.option.votes } { props.option.votes === 1 ? 'vote' : 'votes' }]</span>
                    </div>
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
                    left-align: left;
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

                .option-container-label {
                    text-align: left;
                }

                .option-container-name {
                    display: inline-block;
                    margin: 0 0 0 5px;
                    color: black;
                }

                .option-container-name-votes {
                    font-weight: 700;
                }
            `}</style>
        </Fragment>
    );    
}

export default withFirebase(PollOptionResultViewer);