import React, {useState, useEffect, useRef} from 'react';
import {Icon, Image} from "semantic-ui-react";
import axios from 'axios';
import { document } from 'global';
import { WebRTCAdaptor } from '../../../../static-js/webrtc_adaptor';

function RemoteVideoContainer(props) {

    const [webRTCAdaptor, setWebRTCAdaptor] = useState(null);
    const [nsToken, setNsToken] = useState(null);

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
        if (document) {
            setupWebRTCAdaptor();
        }
    }, [document]);

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
                        break;
                    }
                    case "play_finished": {
                        
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
                errorCallback(error)
            }
        });
        setWebRTCAdaptor(newAdaptor);
    }

    return (
        <div>
            <div className='videoContainer' style={{ height: props.length > 2 ? '50vh' : '100vh' }}>
                <video id={'videoElement' + props.streamId} className='videoElement' width={ props.length > 1 ? '' : '100%' } style={{  left: (props.index % 2 === 0) ? '0' : '', right: (props.index % 2 === 1) ? '0' : '' }} autoPlay/>
            </div>           
            <style jsx>{`
               .videoContainer {
                    position: relative;
                    background-color: black;
                    width: 100%;
                    margin: 0 auto;
                    z-index: -9999;
               }

               .videoElement {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    max-height: 100%;
                    max-width: 100%;
                    height: auto;
                    z-index: 9900;
                    background-color: black;
               }
          `}</style>
        </div>
    );
}

export default RemoteVideoContainer;