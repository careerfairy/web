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
import Step3Speakers from "./Step3Speakers";
import Step4Mic from "./Step4Mic";
import Step5Confirm from "./Step5Confirm";

function getSteps() {
    return ['Google Chrome', 'Setup Camera', 'Setup Speakers', 'Setup Microphone', 'Confirm'];
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
                                      connectionEstablished,
                                      setConnectionEstablished,
                                      errorMessage,
                                      isStreaming,
                                      audioSource,
                                      setAudioSource,
                                      videoSource,
                                      setVideoSource,
                                      setSpeakerSource,
                                      speakerSource
                                  }) => {
    const [showAudioVideo, setShowAudioVideo] = useState(false);
    const [playSound, setPlaySound] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    console.log("activeStep", activeStep);
    const devices = useUserMedia(showAudioVideo);
    const audioLevel = useSoundMeter(showAudioVideo, localStream);

    const steps = getSteps();

    useEffect(() => {
        if (!audioSource && devices.audioInputList && devices.audioInputList.length > 0) {
            setAudioSource(devices.audioInputList[0].value);
        }
        if (!audioSource && devices.audioOutputList && devices.audioOutputList.length > 0) {
            setSpeakerSource(devices.audioOutputList[0].value);
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
            setActiveStep(4)
        }
    }, [streamerReady, showAudioVideo, connectionEstablished])

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <Step1Chrome setShowAudioVideo={setShowAudioVideo}/>;
            case 1:
                return <Step2Camera audioLevel={audioLevel}
                                    audioSource={audioSource}
                                    devices={devices}
                                    localStream={localStream}
                                    playSound={playSound}
                                    setAudioSource={setAudioSource}
                                    setPlaySound={setPlaySound}
                                    setStreamerReady={setStreamerReady}
                                    setVideoSource={setVideoSource}
                                    videoSource={videoSource}/>;
            case 2:
                return <Step3Speakers setSpeakerSource
                                      speakerSource/>
            case 3:
                return <Step4Mic setSpeakerSource
                                      speakerSource/>
            case 4:
                return <Step5Confirm setSpeakerSource
                                      speakerSource/>
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