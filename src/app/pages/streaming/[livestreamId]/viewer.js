import {useState, useEffect, useRef, Fragment} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { useRouter } from 'next/router';
import ViewerVideoContainer from '../../../components/views/streaming/video-container/ViewerVideoContainer';
import { withFirebasePage } from '../../../data/firebase';

function ViewerPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [currentLivestream, setCurrentLivestream] = useState(null);
    const [streamIds, setStreamIds] = useState([]);
    
    useEffect(() => {
        if (livestreamId) {
            props.firebase.listenToScheduledLivestreamById(livestreamId, querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
            });
        }
    }, [livestreamId]);

    useEffect(() => {
        if (currentLivestream && currentLivestream.streamIds) {
            setStreamIds(currentLivestream.streamIds);
        }
    }, [currentLivestream]);

    let videoElements = streamIds.map( (streamId, index) => {
        return (
            <Grid.Column width={ streamIds.length > 1 ? 8 : 16} style={{ padding: 0 }} key={streamId}>
                <div className='video-container' style={{ height: streamIds.length > 1 ? '50vh' : '100vh'}}>   
                    <ViewerVideoContainer streamId={streamId} length={streamIds.length} index={index + 1} />
                </div>
            </Grid.Column>
        );
    });

    return (
        <div className='topLevelContainer'>
            <div className='black-frame'>
                <Grid style={{ margin: 0 }}>
                    { videoElements }
                </Grid>
            </div>
            <div className='left-container'>
                    
            </div>
            <style jsx>{`
                .hidden {
                    display: none
                }

                .top-menu {
                    text-align: center;
                    padding: 20px;
                    margin: 0 0 30px 0;
                }

                .remoteVideoContainer {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translate(-50%);
                    width: 80%;
                    height: 200px;
                }

                .video-container {
                    position: relative;
                    background-color: black;
                    width: 100%;
                    margin: 0 auto;
                    z-index: -9999;
                }

                #localVideo {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    max-height: 100%;
                    height: auto;
                    z-index: 9900;
                    background-color: black;
                }

                .side-button {
                    cursor: pointer;
                }

                .test-title {
                    font-size: 2em;
                    margin: 30px 0;
                }

                .test-button {
                    margin: 20px 0;
                }

                .test-hint {
                    margin: 20px 0;
                }

                .teal {
                    color: rgb(0, 210, 170);
                    font-weight: 700;
                }

                .black-frame {
                    position: absolute;
                    top: 0;
                    left: 120px;
                    width: calc(100% - 120px);
                    min-width: 700px;
                    height: 100%;
                    min-height: 600px;
                    z-index: -10;
                    background-color: black;
                    cursor: pointer;
                }

                .video-container {
                    
                }

                .button-container {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    height: 90px;
                    cursor:  pointer;
                    padding: 17px;
                    z-index: 8000;
                }

                .left-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100vh;
                    width: 120px;
                    padding: 20px;
                    background-color: rgb(80,80,80);
                }

                .logo-container {
                    position: absolute;
                    bottom: 90px;
                    left: 0;
                    right: 0;
                    color: rgb(0, 210, 170);
                    font-size: 1.4em;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}

export default withFirebasePage(ViewerPage);