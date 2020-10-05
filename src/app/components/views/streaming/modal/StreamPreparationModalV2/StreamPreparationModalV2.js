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
    Button
} from '@material-ui/core'
import {useSoundMeter} from 'components/custom-hook/useSoundMeter';
import SoundLevelDisplayer from 'components/views/common/SoundLevelDisplayer';
import useUserMedia from 'components/custom-hook/useDevices';
import Draggable from 'react-draggable';
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import Step1Chrome from "./Step1Chrome";
import Step2Camera from "./Step2Camera";
import Step3Speakers from "./Step3Speakers";
import Step4Mic from "./Step4Mic";
import Step5Confirm from "./Step5Confirm";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    stepper: {
        paddingLeft: 0,
        paddingRight: 0
    }
}))

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
    const classes = useStyles()
    const [showAudioVideo, setShowAudioVideo] = useState(false);
    const [playSound, setPlaySound] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = React.useState(new Set());
    const [skipped, setSkipped] = React.useState(new Set());
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

    const totalSteps = () => {
        return getSteps().length;
    };

    const isStepOptional = (step) => {
        // return step === 1;
        return false
    };

    const isCompleted = () =>{
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
        if (completed.size !== totalSteps() - skippedSteps()) {
            handleNext();
        }
    };

    const handleReset = () => {
        setActiveStep(0);
        setCompleted(new Set());
        setSkipped(new Set());
    };

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    function isStepComplete(step) {
        return completed.has(step);
    }


    const attachSinkId = (element, sinkId) => {
        if (typeof element.sinkId !== 'undefined') {
            console.log("element", element);
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

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <Step1Chrome handleComplete={handleComplete}/>;
            case 1:
                return <Step2Camera audioLevel={audioLevel}
                                    audioSource={audioSource}
                                    devices={devices}
                                    localStream={localStream}
                                    playSound={playSound}
                                    setAudioSource={setAudioSource}
                                    setPlaySound={setPlaySound}
                                    handleNext={handleComplete}
                                    setStreamerReady={setStreamerReady}
                                    setVideoSource={setVideoSource}
                                    videoSource={videoSource}/>;
            case 2:
                return <Step3Speakers setSpeakerSource={setSpeakerSource}
                                      devices={devices}
                                      attachSinkId={attachSinkId}
                                      handleNext={handleComplete}
                                      localStream={localStream}
                                      speakerSource={speakerSource}/>
            case 3:
                return <Step4Mic setAudioSource={setAudioSource}
                                 audioLevel={audioLevel}
                                 devices={devices}
                                 handleNext={handleComplete}
                                 attachSinkId={attachSinkId}
                                 localStream={localStream}
                                 playSound={playSound}
                                 speakerSource={speakerSource}
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
                </Stepper>
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

                    {isCompleted() ? (
                        <Typography variant="caption" className={classes.completed}>
                            Step {activeStep + 1} already completed
                        </Typography>
                    ) : (null
                        // <Button variant="contained" color="primary" onClick={handleComplete}>
                        //     {completedSteps() === totalSteps() - 1 ? 'Finish' : 'Complete Step'}
                        // </Button>
                    )}
                </DialogActions>
                <p>Don't worry, your stream will not start until you decide to.</p>
                <p style={{fontSize: '0.8em', color: 'grey'}}>If anything is unclear or not working, please <a
                    href='mailto:thomas@careerfairy.io'>contact us</a>!</p>
            </DialogContent>
        </Dialog>
    );
}

export default withFirebase(StreamPreparationModalV2);