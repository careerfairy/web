import React, {useState} from 'react';
import {withFirebase} from "../../../../context/firebase";
import Dialog from "@material-ui/core/Dialog";
import {Box, Button, DialogContentText, Fade, Typography} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Grow from "@material-ui/core/Grow";
import Collapse from "@material-ui/core/Collapse";


const pdfLink = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-documents%2FExampleReport.pdf?alt=media&token=be44d8be-d914-4074-9197-77d5ab830719"
const DemoEndModal = ({open, handleClose}) => {

    const [activePage, setActivePage] = useState(0)
    const [hasClickedDownload, setHasClickedDownload] = useState(false)
    const [hasJoinedTalentPool, setHasJoinedTalentPool] = useState(false)

    const handleNext = () => {
        setActivePage(prevState => prevState + 1)
    }

    const handleClickJoinTalentPool = () => {
        setHasJoinedTalentPool(!hasJoinedTalentPool)
    }

    const handleDownload = () => {
        setHasClickedDownload(true)
        handleNext()
    }


    return (
        <>
            <Dialog TransitionComponent={Grow} open={Boolean(activePage === 0 && open)}>
                <DialogTitle>
                    What makes us different
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        During the stream, at any time, your viewer are able
                        willingly give their details by clicking on the button
                        Join Talent pool below (this will button will be present on their UI).
                    </DialogContentText>
                    <Box display="flex" flexFlow="column" alignItems="center" style={{width: "100%"}} my={2}>
                        <Button
                            onClick={handleClickJoinTalentPool}
                            children={hasJoinedTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'}
                            variant="contained"
                            startIcon={<PeopleAltIcon/>}
                            color={hasJoinedTalentPool ? "default" : "primary"}/>
                        <Collapse in={hasJoinedTalentPool}>
                            <Typography color="primary">
                                Thanks for joining the talent pool!
                            </Typography>
                        </Collapse>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={!hasJoinedTalentPool}
                        variant="contained"
                        onClick={handleNext}
                        children={'Next'}
                        color={"primary"}/>
                </DialogActions>
            </Dialog>
            <Dialog TransitionComponent={Grow} open={Boolean(activePage === 1 && open)}>
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
                    <Box display="flex" justifyContent="center" style={{width: "100%"}} my={2}>
                        <Button
                            download
                            onClick={handleDownload}
                            href={pdfLink}
                            target="_blank"
                            children={'Download Analytics'}
                            startIcon={<CloudDownloadIcon/>}
                            color={"primary"}/>
                    </Box>
                </DialogContent>
                <Collapse in={hasClickedDownload}>
                    <DialogActions>
                        <Button
                            disabled={!hasClickedDownload}
                            variant="contained"
                            onClick={handleNext}
                            children={'Next'}
                            color={"primary"}/>
                    </DialogActions>
                </Collapse>
            </Dialog>
            <Dialog TransitionComponent={Grow} open={Boolean(activePage === 2 && open)}>
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
            </Dialog>
        </>
    );
};

export default withFirebase(DemoEndModal);
