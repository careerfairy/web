import React from 'react';
import ImageSelect from "../ImageSelect/ImageSelect";
import {Collapse, FormControl, FormHelperText, Grid, TextField} from "@material-ui/core";

const SpeakerForm = (
    {
        firstNameError,
        lastNameError,
        positionError,
        backgroundError,
        firebase,
        index,
        speaker,
        objectKey,
        values,
        setFieldValue,
        errors,
        touched,
        handleBlur,
        ...props
    }) => {


    return (
        <Grid spacing={1} style={{display: "flex"}} container>
            <Grid xs={12} sm={12} md={12} lg={6} xl={6} item>
                <ImageSelect value={speaker.avatarUrl} firebase={firebase} setFieldValue={setFieldValue} {...props}/>
            </Grid>
            <Grid xs={12} sm={12} md={12} lg={6} xl={6} item>
                <FormControl fullWidth>
                    <TextField name={`speakers.${objectKey}.firstName`}
                               id={`speakers.${objectKey}.firstName`}
                               variant="outlined"
                               fullWidth
                               onBlur={handleBlur}
                               label="First Name"
                               inputProps={{maxLength: 70}}
                               value={speaker.firstName}
                               error={Boolean(firstNameError && firstNameError)}
                               onChange={({currentTarget: {value}}) => setFieldValue(`speakers.${objectKey}.firstName`, value)}/>
                    <Collapse in={Boolean(firstNameError)}>
                        <FormHelperText error>
                            {firstNameError}
                        </FormHelperText>
                    </Collapse>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={12} md={12} lg={6} xl={6} item>
                <FormControl fullWidth>
                    <TextField name={`speakers.${objectKey}.lastName`}
                               id={`speakers.${objectKey}.lastName`}
                               variant="outlined"
                               fullWidth
                               onBlur={handleBlur}
                               label="Last Name"
                               inputProps={{maxLength: 70}}
                               value={speaker.firstName}
                               error={Boolean(lastNameError)}
                               onChange={({currentTarget: {value}}) => setFieldValue(`speakers.${objectKey}.lastName`, value)}/>
                    <Collapse in={Boolean(lastNameError)}>
                        <FormHelperText error>
                            {firstNameError}
                        </FormHelperText>
                    </Collapse>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={12} md={12} lg={6} xl={6} item>
                <FormControl fullWidth>
                    <TextField name={`speakers.${objectKey}.position`}
                               id={`speakers.${objectKey}.position`}
                               variant="outlined"
                               fullWidth
                               onBlur={handleBlur}
                               label="Position"
                               inputProps={{maxLength: 70}}
                               value={speaker.position}
                               error={Boolean(positionError)}
                               onChange={({currentTarget: {value}}) => setFieldValue(`speakers.${objectKey}.position`, value)}/>
                    <Collapse in={Boolean(positionError)}>
                        <FormHelperText error>
                            {firstNameError}
                        </FormHelperText>
                    </Collapse>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={12} md={12} lg={6} xl={6} item>
                <FormControl fullWidth>
                    <TextField name={`speakers.${objectKey}.firstName`}
                               id={`speakers.${objectKey}.firstName`}
                               variant="outlined"
                               fullWidth
                               onBlur={handleBlur}
                               label="First Name"
                               inputProps={{maxLength: 70}}
                               value={speaker.firstName}
                               error={Boolean(firstNameError && firstNameError)}
                               onChange={({currentTarget: {value}}) => setFieldValue(`speakers.${objectKey}.firstName`, value)}/>
                    <Collapse in={Boolean(firstNameError)}>
                        <FormHelperText error>
                            {firstNameError}
                        </FormHelperText>
                    </Collapse>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={12} md={12} lg={6} xl={6} item>
                <FormControl fullWidth>
                    <TextField name={`speakers.${objectKey}.firstName`}
                               id={`speakers.${objectKey}.firstName`}
                               variant="outlined"
                               fullWidth
                               onBlur={handleBlur}
                               label="First Name"
                               inputProps={{maxLength: 70}}
                               value={speaker.firstName}
                               error={Boolean(firstNameError && firstNameError)}
                               onChange={({currentTarget: {value}}) => setFieldValue(`speakers.${objectKey}.firstName`, value)}/>
                    <Collapse in={Boolean(firstNameError)}>
                        <FormHelperText error>
                            {firstNameError}
                        </FormHelperText>
                    </Collapse>
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default SpeakerForm;
