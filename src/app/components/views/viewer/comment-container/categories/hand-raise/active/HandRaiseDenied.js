import React from 'react';
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import {Button} from "@material-ui/core";
import Grow from "@material-ui/core/Grow";

function HandRaiseRequested(props) {

    return (
        <>
            <Grow unmountOnExit in={!(!props.handRaiseState || (props.handRaiseState.state !== 'denied'))}>
                <div className='handraise-container'>
                    <div className='central-container'>
                        <h2>Sorry we can't answer your question right now.</h2>
                        <Button size='large' startIcon={<ClearRoundedIcon/>} variant="contained" children='Cancel'
                                onClick={() => props.updateHandRaiseRequest("unrequested")}/>
                    </div>
                </div>
            </Grow>
            <style jsx>{`
                .handraise-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    background-color: rgb(240,240,240);
                }

                .central-container {
                    text-align: center;
                    width: 90%;
                    color: rgb(40,40,40);
                }

                .central-container h2 {
                    font-family: 'Permanent Marker';
                    font-size: 2.3em;
                    color: rgb(0, 210, 170);
                }

                .central-container p {
                    margin: 20px 0 30px 0;
                }

          `}</style>

        </>
    );
}

export default HandRaiseRequested;