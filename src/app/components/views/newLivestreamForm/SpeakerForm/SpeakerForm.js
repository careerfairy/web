import React, {useEffect, useState} from 'react';
import ImageSelect from "../ImageSelect/ImageSelect";
import {Box, Button, Collapse, FormControl, FormHelperText, Grid, TextField, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

const useStyles = makeStyles(theme => ({
    formGrid: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "& .MuiFormControl-root:not(:last-child)": {
            marginBottom: theme.spacing(1),
        }
    }


}));
const SpeakerForm = (
    {
        options,
        firstNameError,
        lastNameError,
        positionError,
        backgroundError,
        firebase,
        index,
        speaker,
        objectKey,
        setFieldValue,
        handleDeleteSpeaker,
        touched,
        handleBlur,
        submitting,
        loading,
        getDownloadUrl,
        values,
    }) => {
    const classes = useStyles()

    const [animate, setAnimate] = useState(false)
    useEffect(() => {
        setAnimate(true)
    }, [])


    return (
        <Collapse xs={12} sm={12} md={12} lg={12} xl={12} component={Grid} item in={animate}>
            <Grid spacing={2} style={{display: "flex"}} container>
                <Grid className={classes.formGrid} xs={12} sm={12} md={12} lg={6} xl={6} item>
                    <FormControl fullWidth>
                        <TextField name={`speakers.${objectKey}.firstName`}
                                   id={`speakers.${objectKey}.firstName`}
                                   variant="outlined"
                                   fullWidth
                                   style={{marginBottom: 0}}
                                   onBlur={handleBlur}
                                   label="First Name"
                                   inputProps={{maxLength: 70}}
                                   value={speaker.firstName}
                                   error={Boolean(firstNameError)}
                                   onChange={({currentTarget: {value}}) => setFieldValue(`speakers.${objectKey}.firstName`, value)}/>
                        <Collapse in={Boolean(firstNameError)}>
                            <FormHelperText error>
                                {firstNameError}
                            </FormHelperText>
                        </Collapse>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField name={`speakers.${objectKey}.lastName`}
                                   id={`speakers.${objectKey}.lastName`}
                                   variant="outlined"
                                   fullWidth
                                   style={{marginBottom: 0}}
                                   onBlur={handleBlur}
                                   label="Last Name"
                                   inputProps={{maxLength: 70}}
                                   value={speaker.lastName}
                                   error={Boolean(lastNameError)}
                                   onChange={({currentTarget: {value}}) => setFieldValue(`speakers.${objectKey}.lastName`, value)}/>
                        <Collapse in={Boolean(lastNameError)}>
                            <FormHelperText error>
                                {lastNameError}
                            </FormHelperText>
                        </Collapse>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField name={`speakers.${objectKey}.position`}
                                   id={`speakers.${objectKey}.position`}
                                   variant="outlined"
                                   fullWidth
                                   onBlur={handleBlur}
                                   label="Position"
                                   style={{marginBottom: 0}}
                                   inputProps={{maxLength: 70}}
                                   value={speaker.position}
                                   error={Boolean(positionError)}
                                   onChange={({currentTarget: {value}}) => setFieldValue(`speakers.${objectKey}.position`, value)}/>
                        <Collapse in={Boolean(positionError)}>
                            <FormHelperText error>
                                {positionError}
                            </FormHelperText>
                        </Collapse>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField name={`speakers.${objectKey}.background`}
                                   id={`speakers.${objectKey}.background`}
                                   variant="outlined"
                                   fullWidth
                                   onBlur={handleBlur}
                                   label="Background"
                                   style={{marginBottom: 0}}
                                   inputProps={{maxLength: 200}}
                                   value={speaker.background}
                                   error={Boolean(backgroundError)}
                                   onChange={({currentTarget: {value}}) => setFieldValue(`speakers.${objectKey}.background`, value)}/>
                        <Collapse in={Boolean(backgroundError)}>
                            <FormHelperText error>
                                {backgroundError}
                            </FormHelperText>
                        </Collapse>
                    </FormControl>
                </Grid>
                <Grid xs={12} sm={12} md={12} lg={6} xl={6} item>
                    <ImageSelect path="mentors-pictures" getDownloadUrl={getDownloadUrl}
                                 formName={`speakers.${objectKey}.avatarUrl`} label="Speaker Avatar" error={false}
                                 handleBlur={handleBlur} submitting={submitting} loading={loading} options={options}
                                 value={speaker.avatarUrl}
                                 firebase={firebase}
                                 setFieldValue={setFieldValue}/>
                </Grid>
            </Grid>
        </Collapse>
    );
};

export default SpeakerForm;
