import React from 'react';
import ImageSelect from "../ImageSelect/ImageSelect";
import {Collapse, FormControl, FormHelperText, Grid, TextField} from "@material-ui/core";

const SpeakerForm = ({firebase, index, speaker, objectKey, values, setFieldValue, errors, ...props}) => {
    console.log("-> props", props);
    const firstNameValue = values.speakers[objectKey].firstName
    const firstNameError = errors?.speakers[objectKey].firstName
    const lastNameValue = values.speakers[objectKey].lastName
    const lastNameError = errors?.speakers[objectKey].lastName
    const avatarUrlValue = values.speakers[objectKey].avatarUrl
    const avatarUrlError = errors?.speakers[objectKey].avatarUrl
    const positionValue = values.speakers[objectKey].position
    const positionError = errors?.speakers[objectKey].position
    const backgroundValue = values.speakers[objectKey].background
    const backgroundError = errors?.speakers[objectKey].background

    return (
        <Grid style={{display: "flex", flexDirection: "column"}} container>
            <Grid xs={12} sm={12} md={12} lg={6} xl={6} item>
                <ImageSelect {...props}/>
            </Grid>
            <Grid xs={12} sm={12} md={12} lg={6} xl={6} item>
                <FormControl fullWidth>
                    <TextField name="title"
                               variant="outlined"
                               fullWidth
                               id="title"
                               label="First Name"
                               inputProps={{maxLength: 70}}
                               {...props}
                               value={firstNameValue}
                               error={Boolean(errors.title && touched.title && errors.title)}
                               onChange={({currentTarget:{value}}) =>setFieldValue(firstNameValue, value)}/>
                    <Collapse in={Boolean(errors.title && touched.title)}>
                        <FormHelperText error>
                            {errors.title}
                        </FormHelperText>
                    </Collapse>
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default SpeakerForm;
