import React, {useState, useEffect, useRef} from 'react';

import {withFirebase} from 'context/firebase';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Paper,
    StepButton,
    Typography,
    DialogActions,
    Button, useMediaQuery, useTheme
} from '@material-ui/core'
import {useSoundMeter} from 'components/custom-hook/useSoundMeter';
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import Step1Chrome from "./Step1Chrome";
import Step2Camera from "./Step2Camera";
import Step3Speakers from "./Step3Speakers";
import Step4Mic from "./Step4Mic";
import Step5Confirm from "./Step5Confirm";
import {makeStyles} from "@material-ui/core/styles";
import window from 'global';

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column"
    },
    stepper: {
        paddingLeft: 0,
        paddingRight: 0
    }
}))

// Firefox 1.0+
var isChromium = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

function getSteps() {
    return ['Get Started', 'Camera', 'Speakers', 'Microphone', 'Confirm'];
}


const StreamPreparationModalV2 = ({
                                      streamerReady,
                                      setStreamerReady,
                                      localStream,
                                      connectionEstablished,
                                      setConnectionEstablished,
                                      isStreaming,
                                      audioSource,
                                      setAudioSource,
                                      videoSource,
                                      setVideoSource,
                                      setSpeakerSource,
                                      speakerSource,
                                      webRTCAdaptor,
                                      devices,
                                      streamId,
                                      attachSinkId,
                                      isTest,
                                      viewer,
                                      handleOpenDemoIntroModal
                                  }) => {
    const classes = useStyles()
    const theme = useTheme()

    const [showAudioVideo, setShowAudioVideo] = useState(false);
    const [value, setValue] = useState(0);
    const [initialDevicesSet, setInitialDevicesSet] = useState(false);

    const [playSound, setPlaySound] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState(new Set());
    const [skipped, setSkipped] = useState(new Set());
    const audioLevel = useSoundMeter(showAudioVideo, localStream, value);
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const steps = getSteps();

    useEffect(() => {
        if (localStream && !initialDevicesSet) {
            if (devices.audioInputList && devices.audioInputList.length > 0 && (!audioSource || !devices.audioInputList.some(device => device.value === audioSource))) {
                updateAudioSource(devices.audioInputList[0].value)
            }
            if (devices.videoDeviceList && devices.videoDeviceList.length > 0 && (!videoSource || !devices.videoDeviceList.some(device => device.value === videoSource))) {
                updateVideoSource(devices.videoDeviceList[0].value)
            }
            if (devices.audioOutputList && devices.audioOutputList.length > 0 && (!speakerSource || !devices.audioOutputList.some(device => device.value === speakerSource))) {
                setSpeakerSource(devices.audioOutputList[0].value);
            }
            setInitialDevicesSet(true);
        }   
    },[devices, localStream]);

    useEffect(() => {
        if (initialDevicesSet) {
            setDevicesFromLocalStorage()
        }
    },[initialDevicesSet]);

    function updateAudioSource(deviceId) {
        webRTCAdaptor.switchAudioInputSource(streamId, deviceId)
        setAudioSource(deviceId);
        setTimeout(() => {
            setValue(value + 1);
        }, 500);
    }

    function updateVideoSource(deviceId) {
        webRTCAdaptor.switchVideoCameraCapture(streamId, deviceId)
        setVideoSource(deviceId);
    }

    const totalSteps = () => {
        return getSteps().length;
    };

    const isStepOptional = (step) => {
        // return step === 1;
        return false
    };

    const isCompleted = () => {
        return activeStep !== steps.length && completed.has(activeStep)
    }

    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            // You probably want to guard against something like this
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    const skippedSteps = () => {
        return skipped.size;
    };

    const completedSteps = () => {
        return completed.size;
    };

    const allStepsCompleted = () => {
        return completedSteps() === totalSteps() - skippedSteps();
    };

    const isLastStep = () => {
        return activeStep === totalSteps() - 1;
    };

    const handleNext = () => {
        const newActiveStep =
            isLastStep() && !allStepsCompleted()
                ? // It's the last step, but not all steps have been completed
                  // find the first step that has been completed
                steps.findIndex((step, i) => !completed.has(i))
                : activeStep + 1;

        setActiveStep(newActiveStep);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStep = (step) => () => {
        setActiveStep(step);
    };

    const handleComplete = () => {
        const newCompleted = new Set(completed);
        newCompleted.add(activeStep);
        setCompleted(newCompleted);
        /**
         * Sigh... it would be much nicer to replace the following if conditional with
         * `if (!this.allStepsComplete())` however state is not set when we do this,
         * thus we have to resort to not being very DRY.
         */

        // if (completedSteps() === totalSteps() - 1) {
        //     handleFinalize()
        // }
        if (completed.size !== totalSteps() - skippedSteps()) {
            handleNext();
        }

    };

    const handleFinalize = () => {
        storeDevices()
        setStreamerReady(true)
        setConnectionEstablished(true)
        if (isTest && !viewer) {
            handleOpenDemoIntroModal()
        }
    }

    const handleReset = () => {
        setActiveStep(0);
        setCompleted(new Set());
        setSkipped(new Set());
    };

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const isStepComplete = (step) => {
        if (step === 0) {
            return completed.has(step) && localStream;
        }
        return completed.has(step);
    }


    const handleMarkComplete = () => {
        const newCompleted = new Set(completed);
        newCompleted.add(activeStep);
        setCompleted(newCompleted);
    }

    const handleMarkIncomplete = () => {
        const newCompleted = new Set(completed);
        newCompleted.delete(activeStep);
        setCompleted(newCompleted);
    }

    const hasDevicesInLocalStorage = () => {
        return localStorage.getItem('selectedDevices');
    }

    const setDevicesFromLocalStorage = () => {
        const devices = JSON.parse(localStorage.getItem('selectedDevices'));
        if (devices) {
            setDevice(devices.videoSource, "video");
            setDevice(devices.audioSource, "audioInput");
            setDevice(devices.speakerSource, "audioOutput");
        }
    }

    const storeDevices = () => {
        localStorage.setItem('selectedDevices', JSON.stringify({
            videoSource,
            audioSource,
            speakerSource
        }));
    }

    const setDevice = (deviceId, deviceType) => {
        if (deviceType === 'video') {
            const deviceExists = devices.videoDeviceList.some( device => device.value === deviceId );
            if (deviceExists) {
                updateVideoSource(deviceId);
            }
        }
        if (deviceType === 'audioInput') {
            const deviceExists = devices.audioInputList.some( device => device.value === deviceId );
            if (deviceExists) {
                updateAudioSource(deviceId);
            }        
        }
        if (deviceType === 'audioOutput') {
            const deviceExists = devices.audioOutputList.some( device => device.value === deviceId );
            if (deviceExists) {
                setSpeakerSource(deviceId);
            }             
        }
    }

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <Step1Chrome handleMarkComplete={handleMarkComplete}
                                    isChromium={isChromium}                                    
                                    localStream={localStream}
                                    isCompleted={isCompleted()}/>;
            case 1:
                return <Step2Camera audioLevel={audioLevel}
                                    audioSource={audioSource}
                                    devices={devices}
                                    handleMarkComplete={handleMarkComplete}
                                    handleMarkIncomplete={handleMarkIncomplete}
                                    isCompleted={isCompleted()}
                                    localStream={localStream}
                                    playSound={playSound}
                                    setAudioSource={updateAudioSource}
                                    setPlaySound={setPlaySound}
                                    setStreamerReady={setStreamerReady}
                                    setVideoSource={updateVideoSource}
                                    videoSource={videoSource}/>;
            case 2:
                return <Step3Speakers setSpeakerSource={setSpeakerSource}
                                      devices={devices}
                                      handleMarkIncomplete={handleMarkIncomplete}
                                      handleMarkComplete={handleMarkComplete}
                                      isCompleted={isCompleted()}
                                      attachSinkId={attachSinkId}
                                      localStream={localStream}
                                      speakerSource={speakerSource}/>
            case 3:
                return <Step4Mic setAudioSource={updateAudioSource}
                                 audioLevel={audioLevel}
                                 devices={devices}
                                 attachSinkId={attachSinkId}
                                 localStream={localStream}
                                 handleMarkIncomplete={handleMarkIncomplete}
                                 handleMarkComplete={handleMarkComplete}
                                 isCompleted={isCompleted()}
                                 playSound={playSound}
                                 streamerReady={streamerReady}
                                 speakerSource={speakerSource}
                                 setPlaySound={setPlaySound}
                                 audioSource={audioSource}/>
            case 4:
                return <Step5Confirm setConnectionEstablished={setConnectionEstablished}
                                     isStreaming={isStreaming}
                                     audioSource={audioSource}
                                     devices={devices}
                                     setStreamerReady={setStreamerReady}
                                     speakerSource={speakerSource}
                                     videoSource={videoSource}
                                     streamerReady={streamerReady}/>
            default:
                return 'Unknown stepIndex';
        }
    }

    return (
        <Dialog fullScreen={fullScreen} fullWidth maxWidth="sm" open={!streamerReady || !connectionEstablished}>
            <DialogTitle disableTypography hidden={streamerReady && connectionEstablished}>
                <h3 style={{color: 'rgb(0, 210, 170)'}}>CareerFairy Streaming</h3>
            </DialogTitle>
            <DialogContent className={classes.root}>
                { isChromium && 
                <Stepper className={classes.stepper} activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => {
                        const stepProps = {};
                        const buttonProps = {};
                        if (isStepOptional(index)) {
                            buttonProps.optional = <Typography variant="caption">Optional</Typography>;
                        }
                        if (isStepSkipped(index)) {
                            stepProps.completed = false;
                        }

                        return (<Step key={label} {...stepProps}>
                            <StepButton onClick={handleStep(index)}
                                        completed={isStepComplete(index)}
                                        {...buttonProps}>
                                {label}
                            </StepButton>
                        </Step>)
                    })}
                </Stepper>}
                {getStepContent(activeStep)}
                { isChromium && 
                <DialogActions>
                    <Button disabled={activeStep === 0} onClick={handleBack} className={classes.button}>
                        Back
                    </Button>
                    <Button
                        disabled={!isStepComplete(activeStep)}
                        onClick={handleNext}
                        className={classes.button}
                    >
                        Next
                    </Button>
                    {isStepOptional(activeStep) && !completed.has(activeStep) && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSkip}
                            className={classes.button}
                        >
                            Skip
                        </Button>
                    )}
                    {
                        hasDevicesInLocalStorage() && activeStep !== 4 && 
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleFinalize()}
                            className={classes.button}
                        >
                            Connect Directly
                        </Button>
                    }
                    {completedSteps() === totalSteps() - 1 && activeStep === 4 &&
                    <Button variant="contained" color="primary" onClick={handleFinalize}>
                        Continue
                    </Button>}
                </DialogActions>}
                <p style={{fontSize: '0.8em', color: 'grey'}}>If anything is unclear or not working, please <a
                    href='mailto:thomas@careerfairy.io'>contact us</a>!</p>
                
            </DialogContent>
        </Dialog>
    );
}

export default withFirebase(StreamPreparationModalV2);