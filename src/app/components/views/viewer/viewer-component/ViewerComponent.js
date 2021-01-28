import {useState, useContext, Fragment, useEffect} from 'react';
import {withFirebasePage} from 'context/firebase';
import useAgoraAsStreamer from 'components/custom-hook/useAgoraAsStreamer';
import CurrentSpeakerDisplayer from 'components/views/streaming/video-container/CurrentSpeakerDisplayer';
import SmallStreamerVideoDisplayer from 'components/views/streaming/video-container/SmallStreamerVideoDisplayer';
import useDevices from 'components/custom-hook/useDevices';
import useMediaSources from 'components/custom-hook/useMediaSources';
import VideoControlsContainer from 'components/views/streaming/video-container/VideoControlsContainer';
import SettingsModal from 'components/views/streaming/video-container/SettingsModal';
import { useAuth } from 'HOCs/AuthProvider';
import { v4 as uuidv4 } from 'uuid';


function ViewerComponent(props) {

    const [showSettings, setShowSettings] = useState(false);
    const [streamerId, setStreamerId] = useState(null);
    const {userData, authenticatedUser} = useAuth();

    const streamerReady = true;
    const devices = useDevices();

    const screenSharingMode = props.currentLivestream.screenSharerId === authenticatedUser?.email && 
        props.currentLivestream.mode === 'desktop';
    const { externalMediaStreams, localMediaStream } =
        useAgoraAsStreamer(
            streamerReady,
            !props.handRaiseActive,
            'localVideo',
            screenSharingMode,
            props.livestreamId,
            streamerId,
            true
        );

    const {
        audioSource,
        updateAudioSource,
        videoSource,
        updateVideoSource,
        speakerSource,
        updateSpeakerSource,
        localMediaStream: displayableMediaStream,
        audioLevel
    } = useMediaSources(devices, authenticatedUser?.email, localMediaStream, !streamerReady || showSettings);

    useEffect(() => {
        if (props.currentLivestream && props.currentLivestream.test) {
            setStreamerId(uuidv4());
        } else if (authenticatedUser?.email) {
            setStreamerId(authenticatedUser.email)
        }
    }, [props.currentLivestream, authenticatedUser])

    const attachSinkId = (element, sinkId) => {
        if (typeof element.sinkId !== 'undefined') {
            element.setSinkId(sinkId)
                .then(() => {
                    console.log(`Success, audio output device attached: ${sinkId}`);
                })
                .catch(error => {
                    let errorMessage = error;
                    if (error.name === 'SecurityError') {
                        errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
                    }
                    console.error(errorMessage);
                    // Jump back to first output device in the list as it's the default.
                });
        } else {
            console.warn('Browser does not support output device selection.');
        }
    }

    const setDesktopMode = async (mode, initiatorId) => {
        let screenSharerId = mode === 'desktop' ? initiatorId : props.currentLivestream.screenSharerId;
        await props.firebase.setDesktopMode(props.currentLivestream.id, mode, screenSharerId);
    }

    if (!props.currentLivestream) {
        return null;
    }

    return (
        <div>
            <div>
                <CurrentSpeakerDisplayer isPlayMode={!props.handRaiseActive}
                                         smallScreenMode={props.currentLivestream.mode === 'presentation' ||  props.currentLivestream.mode === 'desktop'}
                                         speakerSwitchModeActive={false} localStream={null} attachSinkId={attachSinkId}
                                         streams={externalMediaStreams} localId={props.streamerId}
                                         currentSpeaker={props.currentLivestream.currentSpeakerId}
                                         muted={!props.currentLivestream.hasStarted} {...props}/>
            </div>
            {props.currentLivestream.mode === 'presentation' ||  props.currentLivestream.mode === 'desktop' ?
                    <SmallStreamerVideoDisplayer
                        livestreamId={props.currentLivestream.id}
                        presentation={props.currentLivestream.mode === 'presentation'}
                        showMenu={props.showMenu}
                        externalMediaStreams={externalMediaStreams}
                        isLocalScreen={false}
                        attachSinkId={attachSinkId}
                        presenter={false}/>
                    : null
                }
            { props.handRaiseActive && 
                <Fragment>
                    <VideoControlsContainer
                        currentLivestream={props.currentLivestream}
                        viewer={true}
                        streamerId={authenticatedUser.email}
                        joining={true}
                        localMediaStream={localMediaStream}e
                        isMainStreamer={false}
                        setDesktopMode={setDesktopMode}
                        showSettings={showSettings}
                        setShowSettings={setShowSettings}
                    />
                    <SettingsModal open={showSettings} close={() => setShowSettings(false)}
                                streamId={authenticatedUser.email} devices={devices} 
                                localStream={localMediaStream} displayableMediaStream={displayableMediaStream}
                                audioSource={audioSource} updateAudioSource={updateAudioSource}
                                videoSource={videoSource} updateVideoSource={updateVideoSource} audioLevel={audioLevel}
                                speakerSource={speakerSource} setSpeakerSource={updateSpeakerSource}
                                attachSinkId={attachSinkId}/>
                </Fragment>
            }
            <div className={props.currentLivestream.hasStarted ? 'hidden' : ''} style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'white',
                zIndex: '9999'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    fontSize: '1.1em',
                    fontWeight: '700',
                    color: 'rgb(0, 210, 170)',
                    textAlign: 'center'
                }}>
                    {props.currentLivestream.test ? 'The streamer has to press Start Streaming to be visible to students' : 'Thank you for joining!'}
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
                        left: 0;
                        bottom: 0;
                        right: 0;
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

export default withFirebasePage(ViewerComponent);