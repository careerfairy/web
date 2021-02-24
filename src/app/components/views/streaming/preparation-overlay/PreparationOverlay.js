import React, { useEffect, useState } from 'react';
import {withFirebase} from 'context/firebase';
import {makeStyles} from "@material-ui/core/styles";
import {isEmpty} from 'lodash/fp'
import {Button, CircularProgress, Collapse, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Paper, Select, Switch, TextField, Typography} from "@material-ui/core";
import { ControlPoint } from '@material-ui/icons';
import { URL_REGEX } from 'components/util/constants';

const useStyles = makeStyles((theme) => ({
    background: {
        width: "100%",
        height: "100vh",
        backgroundColor: theme.palette.primary.main,
        color: "white"
    },
    centered: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        minWidth: 400
    },
    speakerTitle: {
        fontSize: "1rem",
        textTransform: "uppercase",
        fontWeight: "bold",
        color: theme.palette.text.secondary,
        marginBottom: 10
    },
    speakerName: {
        fontSize: "1.3rem",
        fontWeight: "bold"
    },
    select: {
        minWidth: 200
    },
    selectNewProfile: {
        padding: "10px 0",
        textTransform: "uppercase",
        fontWeight: "bold",
        fontSize: "1rem",
        margin: 5,
        color: theme.palette.text.secondary,
    },
    selectNewProfileIcon: {
        color: theme.palette.text.secondary,
    },
    speakerFunction: {
        fontSize: "1rem",
        color: theme.palette.text.secondary
    },
    title: {
        marginBottom: 20,
    },
    company: {
        fontWeight: "bold"
    },
    padding: {
        padding: "20px 30px",
        margin: "20px 0"
    },
    linkedInSwitch: {
        margin: "20px 0 10px 0",
        fontSize: "0.1rem",
        fontWeight: "bold"
    },
    linkedIn: {
        width: '100%'
    },
    block: {
        display: 'block'
    },
    button: {
        marginTop: 10,
        color: "lightgrey"
    },
    marginTop: {
        marginTop: 10
    }
}));

function PreparationOverlay ({ livestream, streamerUuid, setStreamerReady, firebase }) {
    
    const classes = useStyles();
    const [speaker, setSpeaker] = useState({});

    const [showLinkedIn, setShowLinkedIn] = useState(false);
    const [linkedInUrl, setLinkedInUrl] = useState("");

    const [profileInList, setProfileInList] = useState(true);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false)
    
    const handleChangeSpeaker = (event) => {
        const selectedSpeaker = event.target.value;
        if (selectedSpeaker === undefined) {
            resetSpeaker()
            return setProfileInList(false)
        }
        else if (selectedSpeaker.linkedIn) {
            setLinkedInUrl(selectedSpeaker.linkedIn)
        } else {
            setLinkedInUrl("")
        }
        localStorage.setItem(`speaker${livestream.id}`, selectedSpeaker.id)
        setSpeaker(selectedSpeaker);
    };

    const handleChangeLinkedInShare = (event) => {
        setShowLinkedIn(!showLinkedIn);
    };

    useEffect(() => {
        if (profileInList && livestream.speakers?.length > 0) {
            setInitialSpeakerInList()
        } 
    },[])

    useEffect(() => {
        if (livestream && livestream.speakers && livestream.speakers.length > 0) {
            setProfileInList(true);
        } else {
            setProfileInList(false);
            resetSpeaker()
        }
    },[livestream])

    const joinStream = () => {
        setLoading(true)
        if (!formHasErrors()) {
            speaker.speakerUuid = streamerUuid;
            speaker.showLinkedIn = showLinkedIn;
            speaker.linkedIn = linkedInUrl;
            
            if (speaker.id) {
                firebase.updateSpeakersInLivestream(livestream, speaker).then(() => {
                    setStreamerReady(true)
                    setLoading(false)
                })
            } else {
                firebase.addSpeakerInLivestream(livestream, speaker).then(() => {
                    setStreamerReady(true)
                    setLoading(false)
                })
            }
        } else {
            setLoading(false)
        }
    }

    const formHasErrors = () => {
        let errors = {};
        if (showLinkedIn) {
            errors.linkedInUrl = isEmpty(linkedInUrl.trim()) || !isValidUrl(linkedInUrl)
        }
        if (!profileInList) {
            errors.firstName = isEmpty(speaker.firstName.trim())
            errors.lastName = isEmpty(speaker.lastName.trim())
            errors.position = isEmpty(speaker.position.trim())
        }
        setFormErrors(errors)
        return Object.keys(errors).some( key => errors[key] === true );
    }

    const isValidUrl = (value) => {
        return value.match(URL_REGEX)
    }

    const setInitialSpeakerInList = () => {
        let storedSpeakerId = localStorage.getItem(`speaker${livestream.id}`);
        let selectedSpeaker = storedSpeakerId ? livestream.speakers.find( speaker => speaker.id === storedSpeakerId ) : livestream.speakers[0];
        setSpeaker(selectedSpeaker)
        setShowLinkedIn(selectedSpeaker.showLinkedIn ? true : false)
        setLinkedInUrl(selectedSpeaker.linkedIn ? selectedSpeaker.linkedIn : "")
    }

    const resetSpeaker = () => {
        setSpeaker({ 
            firstName: "",
            lastName: "",
            position: ""
        })
        setLinkedInUrl("");
    }

    const CustomSpeakerDisplay = ({ speaker }) => {
        return (
            <div>
                <Typography variant='h4' className={classes.speakerName}>{speaker.firstName} {speaker.lastName}</Typography>
                <Typography variant='h6' className={classes.speakerFunction}>{speaker.position}</Typography>
            </div>
        )
    }

    let speakers = [];

    if (livestream && livestream.speakers) {
        speakers = livestream.speakers.map( speaker => {
            return (
                <MenuItem value={speaker}>
                    <CustomSpeakerDisplay speaker={speaker}/>
                </MenuItem>
            ) 
        })
    }

    return (
        <div className={classes.background}>
            <div className={classes.centered}>
                <Typography variant="h5" className={classes.title}>Welcome to your stream</Typography>
                <Typography variant="h4">{ livestream.title }</Typography>
                <Typography variant="h5" className={classes.company}>{ livestream.company }</Typography>
                <Paper className={classes.padding}>
                    <Typography variant='h4' className={classes.speakerTitle}>Your Speaker Profile</Typography>
                    <FormGroup>
                        <Collapse in={profileInList}>
                            <FormControl className={classes.marginTop}>
                                <InputLabel id="demo-customized-select-label">Select Your Profile</InputLabel>
                                <Select
                                    labelId="demo-customized-select-label"
                                    id="demo-customized-select"
                                    value={speaker}
                                    className={classes.select}
                                    onChange={handleChangeSpeaker}
                                >
                                    { speakers }
                                    <MenuItem value={undefined}>
                                        <ControlPoint className={classes.selectNewProfileIcon} />
                                        <div className={classes.selectNewProfile}>Add a profile</div>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Collapse>
                        <Collapse in={!profileInList} onExit={setInitialSpeakerInList}>
                            <FormGroup>
                                <FormControl className={classes.marginTop}>
                                    <TextField error={formErrors.firstName && isEmpty(speaker.firstName.trim())} helperText={formErrors.firstName && "Required"} id="outlined-basic" label="First Name" variant="outlined" value={!profileInList ? speaker.firstName : ""} onChange={(event) => setSpeaker({ ...speaker, firstName: event.target.value })}/>
                                </FormControl>
                                <FormControl className={classes.marginTop}>
                                    <TextField error={formErrors.lastName && isEmpty(speaker.lastName.trim())} helperText={formErrors.lastName && "Required"} id="outlined-basic" label="Last Name" variant="outlined" value={!profileInList ? speaker.lastName : ""} onChange={(event) => setSpeaker({ ...speaker, lastName: event.target.value })} />
                                </FormControl>
                                <FormControl className={classes.marginTop}>
                                    <TextField error={formErrors.position && isEmpty(speaker.position.trim())} helperText={formErrors.position && "Required"} id="outlined-basic" label="Occupation" placeholder="Lead Engineer" value={!profileInList ? speaker.position : ""} variant="outlined" onChange={(event) => setSpeaker({ ...speaker, position: event.target.value })} />
                                </FormControl>
                            </FormGroup>
                        </Collapse>
                        {
                            speakers.length > 0 &&
                            <FormControl  className={classes.block}>
                                { profileInList ? 
                                    <Button size="small" onClick={() => setProfileInList(false)} className={classes.button}>Edit Profile</Button> :
                                    <Button size="small" onClick={() => setProfileInList(true)} className={classes.button}>{ `Show list of profiles`}</Button>
                                }
                            </FormControl>
                        }                       
                        <FormControlLabel
                            className={classes.linkedInSwitch}
                            control={
                            <Switch
                                checked={showLinkedIn}
                                onChange={handleChangeLinkedInShare}
                                color="primary"
                                size="small"
                            />
                            }
                            label={ showLinkedIn ? "Show LinkedIn Profile" : "Hide LinkedIn Profile"}
                        />
                        <Collapse in={showLinkedIn}>
                            <FormControl className={classes.linkedIn}>
                                <TextField
                                    required={showLinkedIn}
                                    label="LinkedIn Profile URL"
                                    placeholder="https://linkedin.com/in/your-profile"
                                    value={linkedInUrl}
                                    helperText={formErrors.linkedInUrl && "Please enter a valid URL"}
                                    error={formErrors.linkedInUrl && !isValidUrl(linkedInUrl)}
                                    onChange={(event) => setLinkedInUrl(event.target.value)}
                                    variant="outlined"
                                />
                            </FormControl>
                        </Collapse>
                    </FormGroup>       
                </Paper>             
                <Button variant='contained' size='large' onClick={joinStream} disabled={loading} startIcon={ loading && <CircularProgress size="small"/>}>Join now</Button>
            </div>
        </div>
    )
}

export default withFirebase(PreparationOverlay);