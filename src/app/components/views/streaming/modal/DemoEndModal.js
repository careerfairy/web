import React, {useContext, useState} from 'react';
import {withFirebase} from "../../../../context/firebase";
import Dialog from "@material-ui/core/Dialog";
import {Box, Button, DialogContentText} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import TutorialContext from "../../../../context/tutorials/TutorialContext";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";

const DemoEndModal = ({firebase, livestreamId, open, handleClose}) => {

    const {tutorialSteps, setTutorialSteps} = useContext(TutorialContext);
    const [loading, setLoading] = useState(false)
    const [activePage, setActivePage] = useState(0)

    const handleNext = () => {
        setActivePage(prevState => prevState + 1)
    }

    const pages = [
        <>
            <DialogTitle>
                What makes us different
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    During the stream, at any time, your viewer are able
                    willingly give their details by clicking on the button
                    Join Talent pool below (this will button will be present on their UI).
                </DialogContentText>
                <Box fullWidth m={2}>
                    <Button
                        onClick={handleNext}
                        children={'Join Talent Pool'}
                        variant="contained"
                        startIcon={<PeopleAltIcon/>}
                        color={"primary"}/>
                </Box>
            </DialogContent>
        </>,
        <>
            <DialogTitle>
                What makes us different
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    During the stream, at any time, your viewer are able
                    willingly give their details by clicking on the button
                    Join Talent pool below (this will button will be present on their UI).
                </DialogContentText>
                <Box fullWidth m={2}>
                    <Button
                        onClick={handleNext}
                        children={'Join Talent Pool'}
                        variant="contained"
                        startIcon={<PeopleAltIcon/>}
                        color={"primary"}/>
                </Box>
            </DialogContent>
        </>,

    ]

    return (
        <Dialog open={open}>
            {pages[page]}
        </Dialog>
    );
};

export default withFirebase(DemoEndModal);
