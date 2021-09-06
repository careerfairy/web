import React, {useState} from 'react';
import {withFirebase} from "../../../../context/firebase";
import {
    Box,
    Button,
    DialogContentText,
    Typography,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grow,
    Collapse,
} from "@material-ui/core";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import {TooltipHighlight,} from "../../../../materialUI/GlobalTooltips";
import {GlassDialog} from "../../../../materialUI/GlobalModals";


const pdfLink = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-documents%2FExampleReport.pdf?alt=media&token=bbec2b79-a30d-48f7-927f-bd0941ec5d73"
const DemoEndModal = ({open, handleClose}) => {

    const [activePage, setActivePage] = useState(2)
    const [hasClickedDownload, setHasClickedDownload] = useState(true)
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
            <GlassDialog TransitionComponent={Grow} open={Boolean(activePage === 0 && open)}>
                <DialogTitle>
                    Talent Pool
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        By joining a company's Talent Pool during the stream,
                        students can ask their Career Center to submit their
                        profile data to the company after the event.
                    </DialogContentText>
                    <Box display="flex" flexDirection="column" alignItems="center" style={{width: "100%"}} my={2}>
                        <TooltipHighlight open={!hasJoinedTalentPool}>
                            <Button
                                onClick={handleClickJoinTalentPool}
                                children={hasJoinedTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'}
                                variant="contained"
                                startIcon={<PeopleAltIcon/>}
                                color={hasJoinedTalentPool ? "default" : "primary"}/>
                        </TooltipHighlight>
                        <Collapse in={hasJoinedTalentPool}>
                            <Typography style={{margin: "0.5rem 0"}} algin="center" color="primary">
                                You've now been added to the Talent Pool!
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
            </GlassDialog>
            <GlassDialog TransitionComponent={Grow} open={Boolean(activePage === 1 && open)}>
                <DialogTitle>
                    Analytics Report
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        After the event, Career Centers can download an extensive
                        Analytics Report in their CareerFairy dashboard,
                        which they can then send to the company.
                    </DialogContentText>
                    <Box display="flex" justifyContent="center" style={{width: "100%"}} my={2}>
                        <TooltipHighlight open={!hasClickedDownload}>
                            <a target="_blank" href={pdfLink} onClick={handleDownload} download>
                                <Button
                                    children={'Download Analytics'}
                                    startIcon={<CloudDownloadIcon/>}
                                    color={"primary"}/>
                            </a>
                        </TooltipHighlight>
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
            </GlassDialog>
            <GlassDialog TransitionComponent={Grow} open={Boolean(activePage === 2 && open)}>
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
            </GlassDialog>
        </>
    )
        ;
};

export default withFirebase(DemoEndModal);
