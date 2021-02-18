import React, {Fragment, useEffect, useState} from 'react';
import {withFirebase} from 'context/firebase';
import ShareIcon from '@material-ui/icons/Share';
import GetAppIcon from '@material-ui/icons/GetApp';
import {v4 as uuidv4} from 'uuid';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from "@material-ui/core";
import {CSVLink} from "react-csv";
import StatsUtil from 'data/util/StatsUtil';
import {PDFDownloadLink} from '@react-pdf/renderer';
import LivestreamPdfReport from './LivestreamPdfReport';
import {useLivestreamMetadata} from 'components/custom-hook/useLivestreamMetadata';
import {useTalentPoolMetadata} from 'components/custom-hook/useTalentPoolMetadata';
import {makeStyles} from "@material-ui/core/styles";
import PublishIcon from '@material-ui/icons/Publish';
import ListAltIcon from '@material-ui/icons/ListAlt';
import {useSnackbar} from "notistack";
import AreYouSureModal from "../../../../../../materialUI/GlobalModals/AreYouSureModal";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import {copyStringToClipboard} from "../../../../../helperFunctions/HelperFunctions";
import {useAuth} from "../../../../../../HOCs/AuthProvider";
import StreamerLinksDialog from './StreamerLinksDialog';

const useStyles = makeStyles(theme => {
    const themeWhite = theme.palette.common.white
    return ({
        button: {
            color: themeWhite,
            border: `2px solid ${themeWhite}`,
            marginBottom: theme.spacing(1)
        },
        divider: {
            background: theme.palette.common.white
        }
    })
})
const EnhancedGroupStreamCard = ({
                                     firebase,
                                     livestream,
                                     group,
                                     isPastLivestream,
                                     levelOfStudyModalOpen = false,
                                     handleCloseLevelOfStudyModal,
                                     handleOpenLevelOfStudyModal,
                                     switchToNextLivestreamsTab,
                                     handleEditStream,

                                     isDraft,
                                     router,
                                     hasOptions
                                 }) => {
    const classes = useStyles()
    const {authenticatedUser, userData} = useAuth()
    const {enqueueSnackbar} = useSnackbar()

    const [localCategories, setLocalCategories] = useState([]);
    const [groupCategories, setGroupCategories] = useState([]);
    const [allGroups, setAllGroups] = useState([]);

    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [registeredStudentsFromGroup, setRegisteredStudentsFromGroup] = useState([]);
    const [publishingDraft, setPublishingDraft] = useState(false);

    const [deletingStream, setDeletingStream] = useState(false);
    const [openAreYouSureModal, setOpenAreYouSureModal] = useState(false);
    const [startDownloadingReport, setStartDownloadingReport] = useState(false);
    const [openStreamerLinksDialog, setOpenStreamerLinksDialog] = useState(false);
    const {
        hasDownloadedReport,
        questions,
        polls,
        icons,
        livestreamSpeakers,
        overallRating,
        contentRating,
        talentPoolForReport,
        participatingStudents,
        participatingStudentsFromGroup,
        studentStats
    } = useLivestreamMetadata(livestream, group, firebase, startDownloadingReport);

    const [startDownloadingTalentPool, setStartDownloadingTalentPool] = useState(false);
    const {
        hasDownloadedTalentPool,
        talentPool
    } = useTalentPoolMetadata(livestream, allGroups, group, firebase, registeredStudentsFromGroup, startDownloadingTalentPool);

    useEffect(() => {
        if (livestream && livestream.targetCategories && livestream.targetCategories[group.id] && levelOfStudyModalOpen) {
            setLocalCategories(livestream.targetCategories[group.id])

        }
    }, [livestream, levelOfStudyModalOpen])

    useEffect(() => {
        if (group && group.categories) {
            let fieldOfStudyCategories = group.categories.find(category => category.name?.toLowerCase() === "field of study");
            if (fieldOfStudyCategories && fieldOfStudyCategories.options) {
                setGroupCategories(fieldOfStudyCategories.options);
            }
        }
    }, [group])

    useEffect(() => {
        firebase.getAllCareerCenters().then(querySnapshot => {
            let careerCenters = [];
            querySnapshot.forEach(doc => {
                let cc = doc.data();
                cc.id = doc.id;
                careerCenters.push(cc);
            });
            setAllGroups(careerCenters);
        })
    }, []);

    useEffect(() => {
        if (livestream && group) {
            firebase.getLivestreamRegisteredStudents(livestream.id).then(querySnapshot => {
                let registeredStudents = [];
                querySnapshot.forEach(doc => {
                    let student = doc.data();
                    student.id = doc.id;
                    registeredStudents.push(student);
                });
                setRegisteredStudents(registeredStudents);
            })
        }
    }, [livestream]);

    useEffect(() => {
        if (registeredStudents && registeredStudents.length) {
            let studentsOfGroup = [];
            registeredStudents.forEach(registeredStudent => {
                if (studentBelongsToGroup(registeredStudent)) {
                    let publishedStudent = StatsUtil.getStudentInGroupDataObject(registeredStudent, group);
                    studentsOfGroup.push(publishedStudent);
                }
            });
            setRegisteredStudentsFromGroup(studentsOfGroup);
        }
    }, [registeredStudents]);


    function studentBelongsToGroup(student) {
        if (group.universityCode) {
            if (student.universityCode === group.universityCode) {
                return student.groupIds && student.groupIds.includes(group.groupId);
            } else {
                return false;
            }
        } else {
            return student.groupIds && student.groupIds.includes(group.groupId);
        }
    }

    function getOptionName(optionId) {
        let correspondingOption = {};
        correspondingOption = groupCategories.find(option => option.id === optionId);
        return correspondingOption?.name || 'CATEGORY_UNDEFINED';
    }

    function addElement(optionId) {
        if (localCategories.indexOf(optionId) < 0) {
            setLocalCategories([...localCategories, optionId])
        }
    }

    function removeElement(optionId) {
        const filteredOptions = localCategories.filter(option => option !== optionId);
        setLocalCategories(filteredOptions);
    }

    function updateLivestreamCategories() {
        let categoryCopy = livestream.targetCategories ? livestream.targetCategories : {};
        categoryCopy[group.id] = localCategories;
        firebase.updateLivestreamCategories(livestream.id, categoryCopy).then(() => {
            handleCloseLevelOfStudyModal()
        });
    }

    const sendErrorMessage = () => {
        enqueueSnackbar("something went Wrong, please refresh the page", {
            variant: "error",
            preventDuplicate: true
        })
    }

    const handleCloseAreYouSureModal = () => {
        setOpenAreYouSureModal(false)
    }
    const handleOPenAreYouSureModal = () => {
        setOpenAreYouSureModal(true)
    }

    const handleDeleteStream = async () => {
        try {
            setDeletingStream(true)
            const targetCollection = isDraft ? "draftLivestreams" : "livestreams"
            await firebase.deleteLivestream(livestream.id, targetCollection)
            setDeletingStream(false)
        } catch (e) {
            setDeletingStream(false)
            console.log("-> e", e);
            sendErrorMessage()
        }

    }

    const handleCreateExternalLink = () => {
        let baseUrl = "https://careerfairy.io";
        if (window?.location?.origin) {
            baseUrl = window.location.origin;
        }
        const draftId = livestream.id;
        const targetPath = `${baseUrl}/draft-stream?draftStreamId=${draftId}`;
        copyStringToClipboard(targetPath);
        enqueueSnackbar("Link has been copied to your clipboard!", {
            variant: "success",
            preventDuplicate: true,
        });
    }

    const handlePublishStream = async () => {
        try {
            setPublishingDraft(true)
            const newStream = {...livestream}
            newStream.companyId = uuidv4()
            const author = {
                email: authenticatedUser.email
            }
            if (group?.id) {
                author.groupId = group.id
            }
            await firebase.addLivestream(newStream, "livestreams", author)
            await firebase.deleteLivestream(livestream.id, "draftLivestreams")
            switchToNextLivestreamsTab()
            setPublishingDraft(false)
        } catch (e) {
            setPublishingDraft(false)
            sendErrorMessage()
        }
    }

    const isWorkInProgress = () => !livestream.status?.pendingApproval;


    let categoryElements = localCategories.map((category, index) => {
        return (
            <Chip
                size={"medium"}
                variant={"outlined"}
                key={category.id || index}
                onDelete={() => removeElement(category)}
                label={getOptionName(category)}/>
        );
    });

    let menuItems = groupCategories.map(group => {
        return (
            <MenuItem value={group.id} key={group.id}>{group?.name}</MenuItem>
        );
    });

    const isCareerCenter = () => Boolean(group.universityCode)

    return (
        <>
            <Box p={2} style={{width: "100%"}}>
                <Typography gutterBottom align="center" style={{fontWeight: "bold"}} variant="h5">
                    {registeredStudentsFromGroup.length} students registered
                </Typography>
                {isDraft &&
                <Button
                    className={classes.button}
                    fullWidth
                    disabled={publishingDraft || isWorkInProgress()}
                    onClick={handlePublishStream}
                    startIcon={publishingDraft ? <CircularProgress size={20} color="inherit"/> : <PublishIcon/>}
                    variant='outlined'
                >
                    {publishingDraft ? "Publishing" : isWorkInProgress() ? "Needs To Be Approved" : "Publish Stream"}
                </Button>}
                {isDraft &&
                <Button
                    className={classes.button}
                    fullWidth
                    onClick={handleCreateExternalLink}
                    startIcon={<ShareIcon/>}
                    variant='outlined'
                >
                    Generate external Link to Edit Draft
                </Button>}
                <Button
                    className={classes.button}
                    fullWidth
                    onClick={() => handleEditStream(livestream)}
                    startIcon={<ListAltIcon/>}
                    variant='outlined'
                >
                    {isDraft ? "Edit Draft" : "Edit Stream"}
                </Button>
                {!isDraft &&
                <Button
                    className={classes.button}
                    fullWidth
                    onClick={() => setOpenStreamerLinksDialog(true)}
                    startIcon={<ShareIcon/>}
                    variant='outlined'
                >
                    Get Streamer Links
                </Button>}
                <StreamerLinksDialog livestreamId={livestream.id} openDialog={openStreamerLinksDialog} setOpenDialog={setOpenStreamerLinksDialog}/>
                {isCareerCenter() || userData?.isAdmin &&
                <CSVLink data={registeredStudentsFromGroup} separator={";"}
                         filename={'Registered Students ' + livestream.company + ' ' + livestream.id + '.csv'}
                         style={{color: 'red'}}>
                    <Button className={classes.button} fullWidth startIcon={<GetAppIcon/>} variant='outlined'>
                        Registered Students
                    </Button>
                </CSVLink>}
                <Fragment>
                    {!startDownloadingTalentPool || !hasDownloadedTalentPool ?
                        <div>
                            <Button className={classes.button} fullWidth variant='outlined'
                                    onClick={() => setStartDownloadingTalentPool(true)}
                                    disabled={startDownloadingTalentPool}>
                                {startDownloadingTalentPool ? 'Generating Talent Pool...' : 'Generate Talent Pool'}
                            </Button>
                        </div> :
                        <CSVLink data={talentPool} separator={";"}
                                 filename={'TalentPool ' + livestream.company + ' ' + livestream.id + '.csv'}
                                 style={{color: 'red'}}>
                            <Button className={classes.button} fullWidth startIcon={<GetAppIcon/>} variant='outlined'>
                                Talent Pool
                            </Button>
                        </CSVLink>
                    }
                </Fragment>
                {
                    isPastLivestream &&
                    <Fragment>
                        {!startDownloadingReport || !hasDownloadedReport ?
                            <div>
                                <Button className={classes.button}
                                        fullWidth
                                        style={{color: "white"}}
                                        startIcon={startDownloadingReport &&
                                        <CircularProgress size={20} color="inherit"/>}
                                        variant='outlined' onClick={() => setStartDownloadingReport(true)}
                                        disabled={startDownloadingReport}>{startDownloadingReport ? 'Generating Report...' : 'Generate Report'}</Button>
                            </div> :
                            <PDFDownloadLink fileName={`General Report ${livestream.company} ${livestream.id}.pdf`}
                                             document={
                                                 <LivestreamPdfReport group={group}
                                                    livestream={livestream}
                                                    studentStats={studentStats}
                                                    speakers={livestream.speakers}
                                                    overallRating={overallRating}
                                                    contentRating={contentRating}
                                                    totalStudentsInTalentPool={talentPoolForReport.length}
                                                    totalViewerFromOutsideETH={participatingStudents.length - participatingStudentsFromGroup.length}
                                                    totalViewerFromETH={participatingStudentsFromGroup.length}
                                                    questions={questions} polls={polls}
                                                    icons={icons}/>}>
                                {({blob, url, loading, error}) => (
                                    <div>
                                        <Button className={classes.button} fullWidth variant='outlined' color='primary'>Download
                                            Report</Button>
                                    </div>
                                )}
                            </PDFDownloadLink>
                        }

                    </Fragment>
                }
                <Button
                    className={classes.button}
                    fullWidth
                    onClick={handleOPenAreYouSureModal}
                    startIcon={<DeleteForeverIcon/>}
                    variant='outlined'
                >
                    {isDraft ? "Delete Draft" : "Delete Stream"}
                </Button>
                <AreYouSureModal
                    open={openAreYouSureModal}
                    handleClose={handleCloseAreYouSureModal}
                    handleConfirm={handleDeleteStream}
                    loading={deletingStream}
                    message={`Are you sure this ${isDraft ? "draft" : "stream"}? you will be no longer able to recover it`}
                />
                <Dialog open={levelOfStudyModalOpen} onClose={handleCloseLevelOfStudyModal} fullWidth maxWidth="sm">
                    <DialogTitle align="center">Update Target Groups</DialogTitle>
                    <DialogContent>
                        <FormControl variant="outlined" fullWidth style={{marginBottom: "10px"}}>
                            <InputLabel>Add a Target Group</InputLabel>
                            <Select
                                value={''}
                                placeholder="Select a target group"
                                onChange={(e) => addElement(e.target.value)}
                                label="New target group"
                            >
                                {menuItems}
                            </Select>
                        </FormControl>
                        {categoryElements}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="contained"
                            size="large"
                            color="primary"
                            onClick={updateLivestreamCategories}
                            autoFocus>
                            Confirm
                        </Button>
                        <Button
                            size="large"
                            onClick={handleCloseLevelOfStudyModal}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            {hasOptions && <Divider className={classes.divider} variant="middle"/>}
        </>
    );
}

export default withFirebase(EnhancedGroupStreamCard);