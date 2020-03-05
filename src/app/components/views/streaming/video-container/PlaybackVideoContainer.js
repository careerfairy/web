import React, {useState, useEffect} from 'react';
import {Icon, Image} from "semantic-ui-react";

import { WebRTCAdaptor } from '../../../../static-js/webrtc_adaptor_new.js';
import axios from 'axios';

function PlaybackVideoContainer(props) {

    const [showPlayButton, setShowPlayButton] = useState(false);

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [nsToken, setNsToken] = useState(null);

    const [isInitialized, setInitialized] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (isInitialized && props.livestream && props.livestream.hasStarted && !isPlaying) {
            setTimeout(() => {
                startPlaying();
            }, 2000);
        }
    }, [props.livestream, isInitialized]);

    useEffect(() => {
        if (isPlaying) {
            setTimeout(() => {
                playVideo().catch( error => {
                    setShowPlayButton(true);
                })
            }, 2000);
        }
    }, [isPlaying]);

    useEffect(() => {
        axios({
            method: 'get',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getXirsysNtsToken',
        }).then( token => { 
                let tempToken = token.data.v;
                tempToken.iceServers.forEach(iceServer => {
                    iceServer.urls = iceServer.url;
                });
                setNsToken(tempToken);
            }).catch(error => {
                console.log(error);
        });
    }, []);

    useEffect(() => {
        if (nsToken && nsToken.iceServers.length > 0 && props.livestream && props.livestream.hasStarted && !isPlaying) {
            
            var pc_config = {
                'iceServers' : nsToken.iceServers
            };

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
                remoteVideoId : "remoteVideo",
                isPlayMode: true,
                callback : function(info, obj) {
                    if (info === "initialized") {
                        console.log("initialized"); 
                        setInitialized(true);            
                    } else if (info === "play_started") {
                        //play_started
                        setIsPlaying(true);
                    } else if (info === "play_finished") {
                        // play finishedthe stream
                        setIsPlaying(false);           
                    } else if (info === "closed") {
                        //console.log("Connection closed");
                        if (typeof obj !== "undefined") {
                            console.log("Connecton closed: " + JSON.stringify(obj));
                        }
                    } else if (info === "refreshConnection") {
                        startStreaming();
                    } else if (info === "updated_stats") {
                        //obj is the PeerStats which has fields
                         //averageOutgoingBitrate - kbits/sec
                        //currentOutgoingBitrate - kbits/sec
                    }
                },
                callbackError : function(error) {
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
                    console.log("error callback: " + error);
                    alert("An unexpected error occured while starting this livestream. Please reload this page and try again.");
                }
            });
            setWebRTCAdaptor(newAdaptor);
        }
    }, [nsToken, props.livestream]);

    function startPlaying() {
        webRTCAdaptor.play(props.livestream.id);
    }

    function playVideo() {
        return document.getElementById("remoteVideo").play();
    }

    return (
        <div>
            <div className='streamingContainer'>
                <video id="remoteVideo" playsInline controls width='100%'></video> 
                <div className={(showPlayButton ? 'hidden' : 'hidden')}><Icon name='play' onClick={() => playVideo()}/></div>
            </div>
            <div className={'connecting-overlay ' + (isPlaying ? 'hidden' : '')} >
                <div className='connecting-overlay-content'>
                    <Image src='/connector.gif' style={{ width: '120px', height: 'auto', margin: '0 auto' }} />
                    <div>Wait a second, the streamer is about to connect</div>
                </div>
            </div>   
            <style jsx>{`
                .hidden {
                    display: none;
                }

                .connecting-overlay {
                    position:absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255,255,255,1);
                }

                .connecting-overlay-content {
                    position: absolute;
                    top:50%;
                    left:50%;
                    transform: translate(-50%, -50%);
                }

                .streamingContainer {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    min-width: 100%;
                    max-height: 100%;
                    height: auto;
                    width: auto;
                    background-color: black;
                    z-index: -9999;
                    cursor: pointer;
                }

                #remoteVideo {
                    position: absolute;
                    width: 100%;
                    max-height: 100%;
                    height: auto;

                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                    z-index: 9900;
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
                }
          `}</style>
        </div>
    );
}

export default PlaybackVideoContainer;