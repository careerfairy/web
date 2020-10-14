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
import SoundLevelDisplayer from 'components/views/common/SoundLevelDisplayer';
import useUserMedia from 'components/custom-hook/useDevices';
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
                                      speakerSource,
                                      attachSinkId
                                  }) => {
    const classes = useStyles()
    const theme = useTheme()
    const [showAudioVideo, setShowAudioVideo] = useState(false);
    const [playSound, setPlaySound] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState(new Set());
    const [skipped, setSkipped] = useState(new Set());
    const devices = useUserMedia(activeStep);
    const audioLevel = useSoundMeter(showAudioVideo, localStream);
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

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
        setStreamerReady(true)
        setConnectionEstablished(true)
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

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <Step1Chrome handleMarkComplete={handleMarkComplete}
                                    isChromium={isChromium}
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
                                    setAudioSource={setAudioSource}
                                    setPlaySound={setPlaySound}
                                    setStreamerReady={setStreamerReady}
                                    setVideoSource={setVideoSource}
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
                return <Step4Mic setAudioSource={setAudioSource}
                                 audioLevel={audioLevel}
                                 devices={devices}
                                 attachSinkId={attachSinkId}
                                 localStream={localStream}
                                 handleMarkIncomplete={handleMarkIncomplete}
                                 handleMarkComplete={handleMarkComplete}
                                 isCompleted={isCompleted()}
                                 playSound={playSound}
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
                        variant="contained"
                        color="primary"
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