import React, {useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Divider,
    Typography,
    makeStyles, FormHelperText, Grow
} from '@material-ui/core';
import FilePickerContainer from "../../../../ssr/FilePickerContainer";
import PublishIcon from "@material-ui/icons/Publish";
import CircularProgress from "@material-ui/core/CircularProgress";
import {useSnackbar} from "notistack";
import {GENERAL_ERROR} from "../../../../util/constants";
import {uploadLogo} from "../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles(theme => ({
    root: {},
    avatar: {
        padding: theme.spacing(1),
        marginBottom: theme.spacing(1),
        height: "100%",
        width: "100%",
        "& img": {
            objectFit: "contain"
        }
    },
    actionsWrapper: {
        display: "flex",
        flexDirection: "column",
    },
    saveButton:{
        marginTop: theme.spacing(1)
    }
}));

const Profile = ({group, firebase, className, ...rest}) => {
    const classes = useStyles();
    const [editData, setEditData] = useState({});
    const [filePickerError, setFilePickerError] = useState('');
    const [submittingLogo, setSubmittingLogo] = useState(false);
    const {enqueueSnackbar} = useSnackbar()

    const handleSubmitLogo = async (e) => {
        e.preventDefault();
        try {
            setSubmittingLogo(true);
            await uploadLogo("group-logos", editData.fileObj, firebase, async (newUrl, fullPath) => {
                await firebase.updateCareerCenter(group.id, {logoUrl: newUrl});
            });
            setEditData({})
            setSubmittingLogo(false);
        } catch (e) {
            setSubmittingLogo(false);
            console.log("-> e", e);
            enqueueSnackbar(GENERAL_ERROR, {
                variant: "error",
                preventDuplicate: true,
            })
        }
    };

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardContent>
                <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                >
                    <Avatar
                        variant="rounded"
                        className={classes.avatar}
                        src={editData.logoUrl || group.logoUrl}
                    />
                    <Typography
                        color="textPrimary"
                        gutterBottom
                        align="center"
                        variant="h3"
                    >
                        {group.universityName}
                    </Typography>
                    <Typography
                        color="textSecondary"
                        variant="body1"
                    >
                        {group.description}
                    </Typography>
                </Box>
            </CardContent>
            <Divider/>
            <CardActions disableSpacing className={classes.actionsWrapper}>
                <FilePickerContainer
                    style={{width: "100%"}}
                    extensions={["jpg", "jpeg", "png"]}
                    maxSize={20}
                    onChange={(fileObject) => {
                        setFilePickerError(null);
                        setEditData({
                            ...editData,
                            fileObj: fileObject,
                            logoUrl: URL.createObjectURL(fileObject),
                        });
                    }}
                    onError={(errMsg) => setFilePickerError(errMsg)}>
                    <Box flexDirection="column" display="flex" alignItems="center">
                        <Button
                            color="primary"
                            size="large"
                            disabled={submittingLogo}
                            fullWidth
                            endIcon={<PublishIcon/>}>
                            {editData.logoUrl ? "Change" : "Upload Logo"}
                        </Button>
                    </Box>
                </FilePickerContainer>
                <Grow unmountOnExit in={Boolean(editData.fileObj)}>
                    <Button
                        className={classes.saveButton}
                        color="primary"
                        onClick={handleSubmitLogo}
                        size="large"
                        variant="contained"
                        fullWidth
                        disabled={submittingLogo}
                        endIcon={
                            submittingLogo && <CircularProgress size={20} color="inherit"/>
                        }
                    >
                        save
                    </Button>
                </Grow>
                <FormHelperText error>{filePickerError}</FormHelperText>
            </CardActions>
        </Card>
    );
};

Profile.propTypes = {
    className: PropTypes.string,
    group: PropTypes.object,
    firebase: PropTypes.object
};

export default Profile;
