import React, {useState, useEffect, Fragment} from 'react';
import {Input, Icon, Button, Modal} from 'semantic-ui-react';

function HandRaiseInactive(props) {

    return (
        <>
            <div className='handraise-container'>
                <div className='central-container'>
                    <h2>Hand Raise is not active</h2>
                    <p>Please wait for the streamer to activate hand raise and join the stream!.</p>
                </div>
            </div>
            <style jsx>{`
                .handraise-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                }

                .central-container {
                    text-align: center;
                    width: 90%;
                    color: grey;
                }

                .central-container h2 {
                    font-family: 'Permanent Marker';
                    font-size: 2.6em;
                }

                .central-container p {
                    margin: 20px 0 30px 0;
                }
          `}</style>
        </>
    );
}

export default HandRaiseInactive;