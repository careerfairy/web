import React, {useEffect, useRef, useState} from 'react';
import FilePickerContainer from 'components/ssr/FilePickerContainer';
import { DeleteForever, GetApp, Add, ArrowDropDown, CheckCircleOutline, Publish} from '@material-ui/icons';
import { Box, Button, ButtonGroup, ClickAwayListener, Container, Grow, MenuItem, MenuList, Paper, Popper, Typography } from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import * as actions from 'store/actions'
import { useDispatch } from 'react-redux';
import { withFirebase } from 'context/firebase';

const useStyles = makeStyles((theme) => ({
    title:{
        color: theme.palette.text.secondary,
        textTransform: "uppercase",
        fontSize: "1.8rem",
        marginBottom: 30
    },
    cvContainer: {
        textAlign: 'center',
        padding: "40px 20px",
        marginBottom: 20
    },
    uploadedContainer: {
        textAlign: 'center',
        padding: "40px 20px",
        marginBottom: 20
    },
    cvButton: {
        cursor: 'pointer'
    },
    buttons: {
        marginTop: 25
    },
    button: {
        backgroundColor: theme.palette.background.default
    },
    buttonIcon: {
        marginRight: 5
    },
    largeIcon: {
        fontSize: "3.5rem",
        marginBottom: 10
    }
}));

const buttonChoices = ['Download CV', 'Upload New CV', 'Delete CV'];

const UserResume = ({firebase, userData}) => {

    const classes = useStyles()
    const dispatch = useDispatch()
    const anchorRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(1);

    
    const uploadLogo = (logoFile) => {
        var storageRef = firebase.getStorageRef();
        let presentationRef = storageRef.child( 'user_resume/' + userData.userEmail + '.pdf' );

        var uploadTask = presentationRef.put(logoFile);

        uploadTask.on('state_changed',
            function(snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                    console.log('Upload is paused');
                    break;
                    case 'running':
                    console.log('Upload is running');
                    break;
                    default:
                    break;
                }
            }, function(error) {    
                switch (error.code) {
                    case 'storage/unauthorized':
                        break;              
                    case 'storage/canceled':
                        break;         
                    case 'storage/unknown':
                        break;
                    default:
                        break;
                }
            }, function() {
                //Upload completed successfully, now we can get the download URL
                console.log("upload successful")
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log("Download Url", downloadURL)
                    dispatch(actions.editUserProfile({ userResume: downloadURL }))
                    setSelectedIndex(0);
                });
            });
        return uploadTask;
    }

    const deleteResume = () => {
        var storageRef = firebase.getStorageRef();
        let presentationRef = storageRef.child( 'user_resume/' + userData.userEmail + '.pdf' );

        presentationRef.delete().then(() => {
            console.log("delete successful")
            dispatch(actions.editUserProfile({ userResume: '' }))
        });
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
      };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    const downloadResume = () => {
        location.href = userData.userResume
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
          return;
        }  
        setOpen(false);
    };

    return (
        <>
            <Typography className={classes.title}  variant="h4">Your CV</Typography>
            {
                userData && userData.userResume ? 
                <div className={classes.uploadedContainer}>
                    <div  className={classes.cvButton}>
                        <CheckCircleOutline className={classes.largeIcon} color='primary'/>
                        <div>You have successfully uploaded your CV!</div>
                        <ButtonGroup variant="contained" className={classes.buttons} ref={anchorRef} aria-label="split button">
                            { selectedIndex === 0 &&
                                <Button className={classes.button} href={userData.userResume} target='_blank'>
                                    <GetApp className={classes.buttonIcon} fontSize='small'/>
                                    Download CV
                                </Button>
                            }
                            { selectedIndex === 1 &&
                                <FilePickerContainer
                                    extensions={['pdf']}
                                    onChange={uploadLogo}
                                    maxSize={20}
                                    onError={errMsg => ( console.log(errMsg) )}>
                                    <Button className={classes.button}>
                                        <Add className={classes.buttonIcon} fontSize='small'/>
                                        Upload New CV
                                    </Button>                  
                                </FilePickerContainer>
                            }
                            { selectedIndex === 2 &&
                                <Button className={classes.button} onClick={deleteResume}>
                                    <DeleteForever className={classes.buttonIcon} fontSize='small'/>
                                    Delete CV
                                </Button>
                            }
                            <Button
                                size="small"
                                aria-controls={open ? 'split-button-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-label="select merge strategy"
                                aria-haspopup="menu"
                                onClick={handleToggle}
                                className={classes.button}
                            >
                                <ArrowDropDown />
                            </Button>
                        </ButtonGroup>
                        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                            {({ TransitionProps, placement }) => (
                                <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                                  }}
                                >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu">
                                        {buttonChoices.map((option, index) => (
                                        <MenuItem
                                            key={option}
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            {option}
                                        </MenuItem>
                                        ))}
                                    </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </div>
                </div> : 
                <div  className={classes.cvContainer}>
                    <Publish className={classes.largeIcon} color='primary'/>
                    <div>You can upload your current CV.</div>
                    <FilePickerContainer
                        extensions={['pdf']}
                        onChange={uploadLogo}
                        maxSize={20}
                        onError={errMsg => ( console.log(errMsg) )}>
                        <Button color='primary' variant='contained'  className={classes.buttons}>
                            <Add className={classes.buttonIcon} fontSize='small'/>
                            Upload New CV
                        </Button>                  
                    </FilePickerContainer>
                </div>
            }
        </> 
    )
}

export default withFirebase(UserResume);