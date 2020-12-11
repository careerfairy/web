import React, {Fragment, useState, useEffect} from 'react';
import {withFirebase} from 'context/firebase';
import EditIcon from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';
import {
    Box,
    Button,
    CardMedia,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    Menu,
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


const useStyles = makeStyles(theme => {
    const themeWhite = theme.palette.common.white
    return ({
        button: {
            color: themeWhite,
            border: `2px solid ${themeWhite}`,
            marginBottom: theme.spacing(1)
        }
    })
})
const EnhancedGroupStreamCard = ({firebase, livestream, group, isPastLivestream}) => {
    const classes = useStyles()
    const [modalOpen, setModalOpen] = useState(false);
    const [localCategories, setLocalCategories] = useState([]);
    const [groupCategories, setGroupCategories] = useState([]);
    const [allGroups, setAllGroups] = useState([]);

    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [registeredStudentsFromGroup, setRegisteredStudentsFromGroup] = useState([]);

    const [startDownloadingReport, setStartDownloadingReport] = useState(false);
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
        if (livestream && livestream.targetCategories && livestream.targetCategories[group.id] && modalOpen) {
            setLocalCategories(livestream.targetCategories[group.id])
        }
    }, [livestream, modalOpen])

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
            setModalOpen(false);
        });
    }

    let categoryElements = localCategories.map((category, index) => {
        return (
            <Chip
                size={"medium"}
                variant={"outlined"}
                key={category.id}
                onDelete={() => removeElement(category)}
                label={getOptionName(category)}/>
        );
    });

    let menuItems = groupCategories.map(group => {
        return (
            <MenuItem value={group.id} key={group.id}>{group?.name}</MenuItem>
        );
    });

    return (
            <Box px={2} style={{width: "100%"}}>
                <Typography gutterBottom align="center" style={{fontWeight: "bold"}} variant="h5">
                    {registeredStudentsFromGroup.length} students registered
                </Typography>
                <Button className={classes.button} onClick={() => setModalOpen(true)}
                        fullWidth
                        startIcon={<EditIcon/>}
                        variant='outlined'>
                    Edit Categories
                </Button>
                <CSVLink data={registeredStudentsFromGroup} separator={";"}
                         filename={'Registered Students ' + livestream.company + ' ' + livestream.id + '.csv'}
                         style={{color: 'red'}}>
                    <Button className={classes.button} fullWidth startIcon={<GetAppIcon/>} variant='outlined'>
                        Registered Students
                    </Button>
                </CSVLink>
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
                            <PDFDownloadLink fileName="somename.pdf"
                                             document={
                                                 <LivestreamPdfReport group={group}
                                                                      livestream={livestream}
                                                                      studentStats={studentStats}
                                                                      speakers={livestreamSpeakers}
                                                                      overallRating={overallRating}
                                                                      contentRating={contentRating}
                                                                      totalStudentsInTalentPool={talentPoolForReport.length}
                                                                      totalViewerFromOutsideETH={participatingStudents.length - participatingStudentsFromGroup.length}
                                                                      totalViewerFromETH={participatingStudentsFromGroup.length}
                                                                      questions={questions} polls={polls}
                                                                      icons={icons}/>}>
                                {({blob, url, loading, error}) => (
                                    <div>
                                        <Button className={classes.button} fullWidth variant='outlined' color='primary'>Download Report</Button>
                                    </div>
                                )}
                            </PDFDownloadLink>
                        }

                    </Fragment>
                }
                <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle align="center">Update Target Groups</DialogTitle>
                    <DialogContent>
                        <FormControl variant="outlined" fullWidth style={{marginBottom: "10px"}}>
                            <InputLabel>Add a Target Group</InputLabel>
                            <Select
                                value={null}
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
                            onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
    );
}

export default withFirebase(EnhancedGroupStreamCard);