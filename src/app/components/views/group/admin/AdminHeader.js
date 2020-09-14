import React, {useEffect, useState, Fragment} from "react";
import {
    Box,
    Button,
    CardMedia,
    Container,
    FormControl,
    FormHelperText,
    IconButton,
    TextField,
    Typography,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import {withFirebase} from "../../../../data/firebase";
import CircularProgress from "@material-ui/core/CircularProgress";
import {makeStyles} from "@material-ui/core/styles";
import FilePickerContainer from "../../../ssr/FilePickerContainer";
import PublishIcon from "@material-ui/icons/Publish";

const useStyles = makeStyles({
    root: {
        marginBottom: "20px",
    },
    logo: {
        objectFit: "contain",
        maxWidth: "80%",
    },
    name: {
        margin: "20px 0 0 0",
        fontWeight: "500",
        fontSize: "calc(1.1em + 2vw)",
        color: "rgb(80,80,80)",
    },
    media: {
        display: "flex",
        justifyContent: "center",
        padding: "1.5em 1em 1em 1em",
        maxHeight: "190px",
    },
    buttons: {
        display: "flex",
        alignItems: "center",
        flex: 0.3,
    },
});

const AdminHeader = ({group, firebase}) => {
    const classes = useStyles();

    const [editTitle, setEditTitle] = useState(false);
    const [filePickerError, setFilePickerError] = useState(null);
    const [submittingLogo, setSubmittingLogo] = useState(false);
    const [error, setError] = useState(null);
    const [editData, setEditData] = useState({
        universityName: "",
        fileObj: null,
        logoUrl: "",
    });

    useEffect(() => {
        if (group) {
            setEditData(group);
        }
    }, [group]);

    useEffect(() => {
        if (error && editData.universityName.length > 3) {
            setError(null);
        }
    }, [error, editData]);

    const handleChangeName = (e) => {
        const value = e.target.value;
        setEditData({...editData, universityName: value});
    };

    const handleOpenEditTitle = () => {
        setEditData({...editData, universityName: group.universityName})
        setEditTitle(true)
    }

    const handleSubmitName = async (e) => {
        try {
            e.preventDefault();
            if (editData.universityName.length < 3)
                return setError("Not long enough");
            await firebase.updateCareerCenter(group.id, {
                universityName: editData.universityName,
            });
            setEditTitle(false);
        } catch (e) {
            console.log("error", e);
        }
    };

    const uploadLogo = async (fileObject) => {
        try {
            var storageRef = firebase.getStorageRef();
            let fullPath = "group-logos" + "/" + fileObject.name;
            let companyLogoRef = storageRef.child(fullPath);
            var uploadTask = companyLogoRef.put(fileObject);

            const snapshot = await uploadTask.then();
            return snapshot.ref.getDownloadURL();
        } catch (e) {
            console.log("error in async", e);
        }
    };

    const handleSubmitLogo = async (e) => {
        e.preventDefault();
        try {
            setSubmittingLogo(true);
            const downloadUrl = await uploadLogo(editData.fileObj);
            await firebase.updateCareerCenter(group.id, {logoUrl: downloadUrl});
            setSubmittingLogo(false);
        } catch (e) {
            setSubmittingLogo(false);
        }
    };

    return (
        <Container className={classes.root}>
            <Box>
                <CardMedia className={classes.media}>
                    <img
                        src={editData.logoUrl || group.logoUrl}
                        className={classes.logo}
                        alt="Group logo"/>
                </CardMedia>
                <FilePickerContainer
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
                            style={{margin: "10px"}}
                            color="primary"
                            size="large"
                            endIcon={<PublishIcon/>}>
                            Change
                        </Button>
                    </Box>
                </FilePickerContainer>
                <FormHelperText error>{filePickerError}</FormHelperText>
                {editData.fileObj && (
                    <Box flexDirection="column" display="flex" alignItems="center">
                        <Button
                            color="primary"
                            onClick={handleSubmitLogo}
                            size="large"
                            disabled={submittingLogo}
                            endIcon={
                                submittingLogo && <CircularProgress size={20} color="inherit"/>
                            }
                        >
                            save
                        </Button>
                    </Box>
                )}
            </Box>
            <Box>
                {editTitle ? (
                    <form
                        style={{display: "flex", maxWidth: 500}}
                        onSubmit={handleSubmitName}
                    >
                        <TextField
                            style={{flex: 0.7}}
                            value={editData.universityName}
                            inputProps={{style: {fontSize: "calc(1.1em + 2vw)"}}}
                            onChange={handleChangeName}
                            error={error}
                            helperText={error}
                        />
                        <div className={classes.buttons}>
                            <IconButton type="submit">
                                <CheckIcon color="primary"/>
                            </IconButton>
                            <IconButton onClick={() => setEditTitle(false)}>
                                <ClearIcon color="primary"/>
                            </IconButton>
                        </div>
                    </form>
                ) : (
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Typography variant="h2">
                            {group.universityName}
                        </Typography>
                        <IconButton onClick={handleOpenEditTitle}>
                            <EditIcon color="primary"/>
                        </IconButton>
                    </div>
                )}
            </Box>
        </Container>
    );
};

export default withFirebase(AdminHeader);
