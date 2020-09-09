import React, {useEffect, useState} from 'react';
import {Avatar, Button, Grid, IconButton, TextField} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import {withFirebase} from "../../../../data/firebase";
import CircularProgress from '@material-ui/core/CircularProgress';
import {makeStyles} from "@material-ui/core/styles";
import FilePickerContainer from "../../../ssr/FilePickerContainer";
import PublishIcon from "@material-ui/icons/Publish";

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    logo: {
        fontSize: '180px',
        width: 'auto',
        height: 'auto',
        boxShadow: '0 0 5px rgb(200,200,200)',
        border: '2px solid rgb(0, 210, 170)'
    }
});

const AdminHeader = ({group, menuItem, firebase}) => {
    const classes = useStyles()

    const [editTitle, setEditTitle] = useState(false)
    const [editLogo, setEditLogo] = useState(false)
    const [filePickerError, setFilePickerError] = useState(null)
    const [submittingLogo, setSubmittingLogo] = useState(false)
    const [error, setError] = useState(null)
    const [editData, setEditData] = useState(
        {
            universityName: "",
            fileObj: null,
            logoUrl: ""
        })

    useEffect(() => {
        if (group) {
            setEditData(group)
        }
    }, [group])


    useEffect(() => {
        if (error && editData.universityName.length > 3) {
            setError(null)
        }
    }, [error, editData])


    const handleChangeName = (e) => {
        const value = e.target.value
        setEditData({...editData, universityName: value})
    }

    const handleSubmitName = async (e) => {
        try {
            e.preventDefault()
            if (editData.universityName.length < 3) return setError("Not long enough")
            await firebase.updateCareerCenter(group.id, {universityName: editData.universityName})
            setEditTitle(false)
        } catch (e) {
            console.log("error", e)
        }
    }

    const uploadLogo = async (fileObject) => {
        try {
            var storageRef = firebase.getStorageRef();
            let fullPath = 'group-logos' + '/' + fileObject.name;
            let companyLogoRef = storageRef.child(fullPath);
            var uploadTask = companyLogoRef.put(fileObject);

            const snapshot = await uploadTask.then()
            return snapshot.ref.getDownloadURL()

        } catch (e) {
            console.log("error in async", e)
        }

    }

    const handleSubmitLogo = async (e) => {
        e.preventDefault()
        try {
            setSubmittingLogo(true)
            const downloadUrl = await uploadLogo(editData.fileObj)
            await firebase.updateCareerCenter(group.id, {logoUrl: downloadUrl})
            setEditLogo(false)
            setSubmittingLogo(false)
        } catch (e) {
            setSubmittingLogo(false)
        }
    }


    return (
        <>
            <div className='white-box'>
                <Grid container>
                    <Grid item xs={6}>
                        <div className='image-outer-container'>
                            <Avatar src={editData.logoUrl || group.logoUrl}
                                    className={classes.logo}
                                    title="Group logo"/>
                            {menuItem === 'settings' && <>
                                <FilePickerContainer
                                    extensions={['jpg', 'jpeg', 'png']}
                                    maxSize={20}
                                    onChange={(fileObject) => {
                                        setFilePickerError(null)
                                        setEditData({
                                            ...editData,
                                            fileObj: fileObject,
                                            logoUrl: URL.createObjectURL(fileObject)
                                        })
                                    }}
                                    onError={errMsg => (setFilePickerError(errMsg))}>
                                    <Button style={{marginTop: '10px'}} color="primary" size='large'
                                            endIcon={<PublishIcon/>}>
                                        {editData.fileObj ? "Change" : "Upload"}
                                    </Button>
                                </FilePickerContainer>
                                <div className="field-error">
                                    {filePickerError && <p className="error-text">{filePickerError}</p>}
                                </div>
                                {editData.fileObj &&
                                <Button color="primary" onClick={handleSubmitLogo} size='large'
                                        disabled={submittingLogo}
                                        endIcon={submittingLogo &&
                                        <CircularProgress size={20} color="inherit"/>}>
                                    save
                                </Button>}

                            </>}
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        {editTitle ?
                            <form style={{display: 'flex'}} onSubmit={handleSubmitName}>
                                <TextField style={{flex: 0.7}}
                                           value={editData.universityName}
                                           inputProps={{style: {fontSize: 'calc(1.1em + 2vw)'}}}
                                           onChange={handleChangeName}
                                           error={error}
                                           helperText={error}
                                />
                                <div className="edit-btn-wrapper">
                                    <IconButton type="submit">
                                        <CheckIcon color="primary"/>
                                    </IconButton>
                                    <IconButton onClick={() => setEditTitle(false)}>
                                        <ClearIcon color="primary"/>
                                    </IconButton>
                                </div>
                            </form>
                            :
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <h1 className='group-name'>{group.universityName}</h1>
                                <IconButton onClick={() => setEditTitle(true)}>
                                    {menuItem === 'settings' && <EditIcon color="primary"/>}
                                </IconButton>
                            </div>}
                    </Grid>
                </Grid>
            </div>
            <style jsx>{`
                         .group-name {
                         margin: 20px 0 20px 0;
                         font-weight: 500;
                         font-size: calc(1.1em + 2vw);
                         color: rgb(80,80,80);
                         }
                         
                         .field-error {
                          margin-top: 10px;
                          }
                          
                          .error-text {
                          color: red;
                          font-weight: lighter;
                          font-size: 1rem;
                          }
                    
                         .edit-btn-wrapper {
                         display: flex;
                         align-items: center;
                         flex: 0.3;
                         }
                         .image-outer-container {
                         max-width: 120px;
                         margin: 0 auto;
                         position: relative;
                         display: flex;
                         flex-direction: column;
                         align-items: center;
                         }
          `}</style>
        </>
    );
};

export default withFirebase(AdminHeader);
