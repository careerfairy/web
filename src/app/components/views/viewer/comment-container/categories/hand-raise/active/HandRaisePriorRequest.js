import React from 'react';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';
import {Button} from "@material-ui/core";
import Grow from "@material-ui/core/Grow";

function HandRaisePriorRequest(props) {

    return (
        <>
            <Grow unmountOnExit in={Boolean(!(props.handRaiseState && props.handRaiseState.state !== 'unrequested'))}>
                <div className='handraise-container'>
                    <div className='central-container'>
                        <div className='animated bounce infinite slow'>
                            <PanToolOutlinedIcon color="primary" style={{fontSize: 40}}/>
                        </div>
                        <h2>Raise your hand and join the stream!</h2>
                        <p>By raising your hand, you can request to join the stream with your computer's audio and video
                            and ask your questions face-to-face.</p>
                        <Button variant="contained" size='large' startIcon={<PanToolOutlinedIcon fontSize="large"/>}
                                children='Raise my hand' onClick={() => props.updateHandRaiseRequest("requested")}
                                color="primary"/>
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

export default HandRaisePriorRequest;