import React, {useState, useEffect, useRef} from 'react';

import {withFirebase} from 'context/firebase';
import {Modal, Input, Icon, Button, Form, Image, Grid, Dropdown, Container} from 'semantic-ui-react';
import {Formik} from 'formik';
import {Dialog, DialogTitle, DialogContent, Paper} from '@material-ui/core'
import {useSoundMeter} from 'components/custom-hook/useSoundMeter';
import SoundLevelDisplayer from 'components/views/common/SoundLevelDisplayer';
import useUserMedia from 'components/custom-hook/useDevices';
import Draggable from 'react-draggable';
import CreateBaseGroup from "../../../group/create/CreateBaseGroup";
import CreateCategories from "../../../group/create/CreateCategories";
import CompleteGroup from "../../../group/create/CompleteGroup";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Step1Chrome from "./Step1Chrome";
import Step2Camera from "./Step2Camera";

function getSteps() {
    return ['Google Chrome', 'Setup Camera', 'Setup Microphone', 'Setup Speakers', 'Confirm'];
}


function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}


const StreamPreparationModalV2 = ({
                                      streamerReady,
                                      setStreamerReady,
                                      localStream,
                                      mediaConstraints,
                                      connectionEstablished, setConnectionEstablished, errorMessage, isStreaming, audioSource, setAudioSource, videoSource, setVideoSource
                                  }) => {

    const [showAudioVideo, setShowAudioVideo] = useState(false);
    const [playSound, setPlaySound] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const testVideoRef = useRef(null);
    const devices = useUserMedia(showAudioVideo);
    const audioLevel = useSoundMeter(showAudioVideo, localStream);

    const steps = getSteps();

    useEffect(() => {
        if (localStream) {
            testVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (!audioSource && devices.audioInputList && devices.audioInputList.length > 0) {
            setAudioSource(devices.audioInputList[0].value);
        }
        if (!videoSource && devices.videoDeviceList && devices.videoDeviceList.length > 0) {
            setVideoSource(devices.videoDeviceList[0].value);
        }
    }, [devices]);

    useEffect(() => {
        if (!streamerReady && !showAudioVideo && !connectionEstablished) {
            setActiveStep(0)
        } else if (!streamerReady && showAudioVideo && !connectionEstablished) {
            setActiveStep(1)
        } else if (streamerReady && !connectionEstablished) {
            setActiveStep(3)
        }
    }, [])

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <Step1Chrome setShowAudioVideo={setShowAudioVideo}/>;
            case 1:
                return <Step2Camera audioLevel={audioLevel}
                                    testVideoRef={testVideoRef}
                                    audioSource={audioSource}
                                    devices={devices}
                                    playSound={playSound}
                                    setAudioSource={setAudioSource}
                                    setPlaySound={setPlaySound}
                                    setStreamerReady={setStreamerReady}
                                    setVideoSource={setVideoSource}
                                    videoSource={videoSource}/>;
            case 2:
                return <h1>step 3</h1>
            default:
                return 'Unknown stepIndex';
        }
    }

    return (
        <Dialog PaperComponent={PaperComponent} open={!streamerReady || !connectionEstablished}>
            <DialogTitle hidden={streamerReady && connectionEstablished} style={{cursor: 'move'}}
                         id="draggable-dialog-title">
                <h3 style={{color: 'rgb(0, 210, 170)'}}>CareerFairy Streaming</h3>
            </DialogTitle>

            {getStepContent(activeStep)}

            <DialogContent hidden={!(streamerReady && !connectionEstablished)}
                           style={{textAlign: 'center', padding: '40px'}}>
                <div
                    style={{display: (streamerReady && !isStreaming && !errorMessage) ? 'block' : 'none'}}>
                    <Image src='/loader.gif' style={{width: '50px', height: 'auto', margin: '0 auto'}}/>
                    <div>Attempting to connect...</div>
                </div>
                <div style={{display: isStreaming ? 'block' : 'none'}}>
                    <Icon name='check circle outline'
                          style={{color: 'rgb(0, 210, 170)', fontSize: '3em', margin: '0 auto'}}/>
                    <h3>You are ready to stream!</h3>
                    <div>Your stream will go live once you press "Start Streaming".</div>
                    <Button content='Continue' style={{marginTop: '20px'}} primary
                            onClick={() => setConnectionEstablished(true)}/>
                </div>
                <div style={{display: errorMessage ? 'block' : 'none'}}>
                    <Icon name='frown outline' style={{color: 'rgb(240, 30, 0)', fontSize: '3em', margin: '0 auto'}}/>
                    <h3>An error occured with the following message:</h3>
                    <div>{errorMessage}</div>
                    <Button content='Try again' style={{margin: '20px 0'}} primary onClick={() => {
                        window.location.reload(false)
                    }}/>
                    <p>If anything is unclear or not working, please <a href='mailto:thomas@careerfairy.io'>contact
                        us</a>!</p>
                </div>
            </DialogContent>
            <DialogContent>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </DialogContent>
        </Dialog>
    );
}

export default withFirebase(StreamPreparationModalV2);