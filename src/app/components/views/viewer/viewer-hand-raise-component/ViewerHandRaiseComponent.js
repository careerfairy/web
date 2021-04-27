import {useState, useEffect, useRef, Fragment} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { useRouter } from 'next/router';
import { withFirebasePage } from 'context/firebase';
import SmallStreamerVideoDisplayer from 'components/views/streaming/video-container/SmallStreamerVideoDisplayer';
import VideoContainer from 'components/views/streaming/video-container/VideoContainer';
import useUserMedia from '../../../custom-hook/useDevices';
import { v4 as uuidv4 } from 'uuid';
import {useAuth} from "../../../../HOCs/AuthProvider";
import useStreamRef from "../../../custom-hook/useStreamRef";

function ViewerHandRaiseComponent(props) {

    const { authenticatedUser, userData } = useAuth();
    const streamRef = useStreamRef();
    const [streamerId, setStreamerId] = useState(uuidv4())

    function updateHandRaiseRequest(state) {
        let authEmail = props.currentLivestream.test ? 'streamerEmail' : authenticatedUser.email;
        props.firebase.updateHandRaiseRequest(streamRef, authEmail, state);
    }

    let streamingCallbacks = {
        onPublishStarted: (infoObj) => {
            updateHandRaiseRequest('connected');
        },
    }

    return (
        <div>
            <div>
                <div>
                    <VideoContainer currentLivestream={ props.currentLivestream } streamerId={ streamerId } additionalCallbacks={streamingCallbacks} viewer={true}/> :     
                </div>
                <div className={ props.currentLivestream.hasStarted ? 'hidden' : '' }style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'white', zIndex: '9999'}}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '1.4em', fontWeight: '700', color: 'rgb(0, 210, 170)'}}>
                        Thank you for joining!
                    </div>
                </div>
            </div>  
            <style jsx>{`
                .hidden {
                    display: none
                }

                .topLevelContainer {
                    position: relative;
                    min-height: 100vh;
                }

                .top-menu {
                    background-color: rgba(245,245,245,1);
                    padding: 15px 0;
                    height: 75px;
                    text-align: center;
                    position: relative;
                }

                @media(max-width: 768px) {
                    .top-menu {
                        display: none;
                    }
                }
    
                .top-menu div, .top-menu button {
                    display: inline-block;
                    vertical-align: middle;
                }
    
                .top-menu #stream-button {
                    margin: 0 50px;
                }
    
                .top-menu.active {
                    background-color: rgba(0, 210, 170, 1);
                    color: white;
                }
    
                .top-menu h3 {
                    font-weight: 600;
                }

                .top-menu-left {
                    display: block;
                    position: absolute;
                    top: 50%;
                    left: 20px;
                    transform: translateY(-50%);
                }

                .top-menu-right {
                    position: absolute;
                    top: 50%;
                    right: 20px;
                    transform: translateY(-50%);
                }

                .remoteVideoContainer {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translate(-50%);
                    width: 80%;
                    height: 200px;
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
                    z-index: 10;
                    background-color: black;
                }

                @media(max-width: 768px) {
                    .black-frame {
                        position: absolute;
                        width: 100%;
                        height: 60vh;
                        top: 0;
                        left: 0;
                        right: 0;
                    }
                }

                @media(min-width: 768px) {
                    .black-frame {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        right: 0;
                        left: 0;
                    }
                }

                .video-box {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background-color: black;
                }

                .video-box-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    z-index: 9999;
                }

                .video-box-overlay-content {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .reactions-sender {
                    position: absolute;
                    padding: 30px 0;
                    top: 50%;
                    transform: translateY(-50%);
                    left: 0;
                    right: 0;
                    z-index: 1100;
                    text-align: center;
                    background-color: rgba(0,0,0,0.6);
                }

                .reactions-sender div {
                    margin-bottom: 20px;
                    font-weight: 700;
                    font-size: 1.2em;
                    color: white;
                }

                .video-menu {
                    position: absolute;
                    bottom: 0;
                    left: 330px;
                    right: 0;
                    height: 85px;
                    z-index: 3000;
                    padding: 12px;
                    text-align: center;
                    width: calc(100% - 330px);
                    background-color: white;
                }

                .video-menu .center {
                    display: inline-block;
                    width: 600px;
                }

                .video-menu .right {
                    float: right;
                    padding: 0 20px 0 0;
                }

                .video-menu-left {
                    z-index: 15;
                }

                @media(max-width: 768px) {
                    .video-menu-left {
                        position: absolute;
                        top: 60vh;
                        left: 0;
                        width: 100%;
                        height: 100vh;
                    }
                }

                @media(min-width: 768px) {
                    .video-menu-left {
                        position: absolute;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        width: 280px;
                    }
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
                    height: calc(100% - 75px);
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

export default withFirebasePage(ViewerHandRaiseComponent);