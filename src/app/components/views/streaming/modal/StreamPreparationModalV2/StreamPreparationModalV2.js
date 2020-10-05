import React, {useState, useEffect, useRef} from 'react';

import {withFirebase} from 'context/firebase';
import {Modal, Input, Icon, Button, Form, Image, Grid, Dropdown, Container} from 'semantic-ui-react';
import {Formik} from 'formik';
import {Dialog, DialogTitle, DialogContent, Paper} from '@material-ui/core'
import {useSoundMeter} from 'components/custom-hook/useSoundMeter';
import SoundLevelDisplayer from 'components/views/common/SoundLevelDisplayer';
import useUserMedia from 'components/custom-hook/useDevices';
import Draggable from 'react-draggable';
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Step1Chrome from "./Step1Chrome";
import Step2Camera from "./Step2Camera";
import Step3Speakers from "./Step3Speakers";
import Step4Mic from "./Step4Mic";
import Step5Confirm from "./Step5Confirm";

function getSteps() {
    return ['Browser', 'Camera', 'Speakers', 'Microphone', 'Confirm'];
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
                                      isStreaming,
                                      audioSource,
                                      setAudioSource,
                                      errorMessage,
                                      videoSource,
                                      setVideoSource,
                                      setSpeakerSource,
                                      speakerSource
                                  }) => {
    const [showAudioVideo, setShowAudioVideo] = useState(false);
    const [playSound, setPlaySound] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const devices = useUserMedia(activeStep);
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

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <Step1Chrome setActiveStep={setActiveStep}/>;
            case 1:
                return <Step2Camera audioLevel={audioLevel}
                                    audioSource={audioSource}
                                    devices={devices}
                                    localStream={localStream}
                                    playSound={playSound}
                                    setAudioSource={setAudioSource}
                                    setPlaySound={setPlaySound}
                                    setActiveStep={setActiveStep}
                                    setStreamerReady={setStreamerReady}
                                    setVideoSource={setVideoSource}
                                    videoSource={videoSource}/>;
            case 2:
                return <Step3Speakers setSpeakerSource={setSpeakerSource}
                                      devices={devices}
                                      speakerSource={speakerSource}/>
            case 3:
                return <Step4Mic setAudioSource={setAudioSource}
                                 audioLevel={audioLevel}
                                 devices={devices}
                                 setPlaySound={setPlaySound}
                                 audioSource={audioSource}/>
            case 4:
                return <Step5Confirm setConnectionEstablished={setConnectionEstablished}
                                     isStreaming={isStreaming}
                                     errorMessage={errorMessage}
                                     streamerReady={streamerReady}/>
            default:
                return 'Unknown stepIndex';
        }
    }

    return (
        <Dialog maxWidth="md" PaperComponent={PaperComponent} open={!streamerReady || !connectionEstablished}>
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
                <p>Don't worry, your stream will not start until you decide to.</p>
                <p style={{fontSize: '0.8em', color: 'grey'}}>If anything is unclear or not working, please <a
                    href='mailto:thomas@careerfairy.io'>contact us</a>!</p>
            </DialogContent>
        </Dialog>
    );
}

export default withFirebase(StreamPreparationModalV2);