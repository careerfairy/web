import React, {useState, useEffect, useRef, Fragment} from 'react';
import {Icon, Image} from "semantic-ui-react";
import axios from 'axios';
import { document } from 'global';
import { WebRTCAdaptor } from '../../../../static-js/webrtc_adaptor';

function ViewerVideoContainer(props) {

    const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [nsToken, setNsToken] = useState(null);

    const [showPlayButton, setShowPlayButton] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        axios({
            method: 'get',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getXirsysNtsToken',
        }).then( token => {                 
                setNsToken(convertTokenFromXirsysApi(token));
            }).catch(error => {
                console.log(error);
        });
    }, []);

    useEffect(() => {
        if (isPlaying) {
            setTimeout(() => {
                playVideo().catch( error => {
                    setShowPlayButton(true);
                })
            }, 500);
        }
    }, [isPlaying]);

    useEffect(() => {
        if (document) {
            setupWebRTCAdaptor();
        }
    }, [document, nsToken]);

    function playVideo() {
        setShowPlayButton(false);
        return document.getElementById('videoElement' + props.streamId).play();
    }

    function convertTokenFromXirsysApi(token) {
        let tempToken = token.data.v;
        let iceServers = [];
        tempToken.iceServers.urls.forEach(url => {
            iceServers.push({
                urls: [ url ],
                username: tempToken.iceServers.username,
                credential: tempToken.iceServers.credential
            });
        });
        tempToken.iceServers = iceServers;
        return tempToken;
    }

    function setupWebRTCAdaptor() {
        var pc_config = nsToken ? { 'iceServers' : nsToken.iceServers } : null; 

        var sdpConstraints = {
            OfferToReceiveAudio : true,
            OfferToReceiveVideo : true
        };

        var mediaConstraints = {
            audio: true,
            video: {
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                aspectRatio: 1.77
            }
        };

        const newAdaptor = new WebRTCAdaptor({
            websocket_url : "wss://thrillin.work/WebRTCAppEE/websocket",
            mediaConstraints : mediaConstraints,
            peerconnection_config : pc_config,
            sdp_constraints : sdpConstraints,
            remoteVideoId : 'videoElement' + props.streamId,
            isPlayMode: true,
            debug: true,
            callback : function (info, infoObj) {
                switch(info) {
                    case "initialized": {
                        this.play(props.streamId);
                        break;
                    }
                    case "play_started": {
                        console.log(infoObj);
                        setIsPlaying(true);
                        break;
                    }
                    case "play_finished": {
                        setIsPlaying(false);
                        break;
                    }
                    case "closed": {
                        
                        break;
                    }
                    case "pong": {
                        
                        break;
                    }
                    default: {
                        console.log(info);
                        console.log(infoObj);
                    }
                }
            },
            callbackError : function(error) {
                console.log(error)
            }
        });
        setWebRTCAdaptor(newAdaptor);
    }

    return (
        <Fragment>
            <div className='videoContainer' style={{ height: '100%' }}>
                <video id={'videoElement' + props.streamId} className='videoElement' width={ props.length > 1 ? '' : '100%' } style={{  left: (props.index % 2 === 0) ? '0' : '', right: (props.index % 2 === 1) ? '0' : '' }}/>
                <div className={(showPlayButton ? 'playButton' : 'hidden')}><Icon name='play' onClick={() => playVideo()}/></div>
            </div>           
            <style jsx>{`
                .hidden {
                    display: none;
                }

               .videoContainer {
                    position: relative;
                    background-color: black;
                    width: 100%;
                    margin: 0 auto;
                    z-index: 1000;
                    border: 2px solid red;
               }

               .videoElement {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    max-height: 100%;
                    max-width: 100%;
                    height: auto;
                    z-index: -9900;
                    background-color: black;
               }

               .playButton {
                    position: absolute;
                    font-size: calc(1em + 1.2vw);
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    z-index: 9991;
                    cursor: pointer !important;
            }
          `}</style>
        </Fragment>
    );
}

export default ViewerVideoContainer;