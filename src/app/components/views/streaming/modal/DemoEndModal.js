import React, {useContext, useState} from 'react';
import {withFirebase} from "../../../../context/firebase";
import Dialog from "@material-ui/core/Dialog";
import {Box, Button, DialogContentText} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TutorialContext from "../../../../context/tutorials/TutorialContext";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Grow from "@material-ui/core/Grow";


const pdfLink = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-documents%2FExampleReport.pdf?alt=media&token=be44d8be-d914-4074-9197-77d5ab830719"
const DemoEndModal = ({open, handleClose}) => {

    const {tutorialSteps, setTutorialSteps} = useContext(TutorialContext);
    const [activePage, setActivePage] = useState(0)
    const [hasClickedDownload, setHasClickedDownload] = useState(false)

    const handleNext = () => {
        setActivePage(prevState => prevState + 1)
    }

    const handleDownload = () => {
        setHasClickedDownload(true)
        handleNext()
    }

    const handleComplete = () => {
        handleNext()
        setTutorialSteps({
            ...tutorialSteps,
            showBubbles: true
        })
    }

    return (
        <Dialog open={open}>
            <Grow mountOnEnter unmountOnExit in={activePage === 0}>
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
                </>
            </Grow>
            <Grow mountOnEnter unmountOnExit in={activePage === 1}>
                <>
                    <DialogTitle>
                        What makes us different
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Once your stream has ended, you will be able to
                            to download analytics of the stream, giving you vital information like
                            like how many student registered, what they study and their universities,
                            to name a few
                        </DialogContentText>
                        <Box display="flex" justifyContent="center" style={{width: "100%"}} m={2}>
                            <Button
                                download
                                href={pdfLink}
                                onClick={handleDownload}
                                children={'Download Analytics'}
                                startIcon={<CloudDownloadIcon/>}
                                color={"primary"}/>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            download
                            disabled={!hasClickedDownload}
                            variant="contained"
                            onClick={handleComplete}
                            children={'Next'}
                            color={"primary"}/>
                    </DialogActions>
                </>
            </Grow>
            <Grow mountOnEnter unmountOnExit in={activePage === 2}>
                <>
                    <DialogTitle>
                        Congratulations!!
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You've now completed the tutorial :).
                            We believe you're now ready to venture into the world of streaming!
                            Good luck!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            disabled={!hasClickedDownload}
                            variant="contained"
                            onClick={handleClose}
                            children={'Back to Stream'}
                            color={"primary"}/>
                    </DialogActions>
                </>
            </Grow>
        </Dialog>
    );
};

export default withFirebase(DemoEndModal);
