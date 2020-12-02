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
import GroupStreamCard from 'components/views/NextLivestreams/GroupStreams/GroupStreamCard';
import {CSVLink} from "react-csv";
import StatsUtil from 'data/util/StatsUtil';
import {PDFDownloadLink, Document, Page, View, Text} from '@react-pdf/renderer';
import LivestreamPdfReport from './LivestreamPdfReport';
import {useLivestreamMetadata} from 'components/custom-hook/useLivestreamMetadata';
import {useTalentPoolMetadata} from 'components/custom-hook/useTalentPoolMetadata';

const EnhancedGroupStreamCard = (props) => {

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
    } = useLivestreamMetadata(props.livestream, props.group, props.firebase, startDownloadingReport);

    const [startDownloadingTalentPool, setStartDownloadingTalentPool] = useState(false);
    const {
        hasDownloadedTalentPool,
        talentPool
    } = useTalentPoolMetadata(props.livestream, allGroups, props.group, props.firebase, registeredStudentsFromGroup, startDownloadingTalentPool);

    useEffect(() => {
        if (props.livestream && props.livestream.targetCategories && props.livestream.targetCategories[props.group.id] && modalOpen) {
            setLocalCategories(props.livestream.targetCategories[props.group.id])
        }
    }, [props.livestream, modalOpen])

    useEffect(() => {
        if (props.group && props.group.categories) {
            let fieldOfStudyCategories = props.group.categories.find(category => category.name?.toLowerCase() === "field of study");
            if (fieldOfStudyCategories && fieldOfStudyCategories.options) {
                setGroupCategories(fieldOfStudyCategories.options);
            }
        }
    }, [props.group])

    useEffect(() => {
        props.firebase.getAllCareerCenters().then(querySnapshot => {
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
        if (props.livestream && props.group) {
            props.firebase.getLivestreamRegisteredStudents(props.livestream.id).then(querySnapshot => {
                let registeredStudents = [];
                querySnapshot.forEach(doc => {
                    let student = doc.data();
                    student.id = doc.id;
                    registeredStudents.push(student);
                });
                setRegisteredStudents(registeredStudents);
            })
        }
    }, [props.livestream]);

    useEffect(() => {
        if (registeredStudents && registeredStudents.length) {
            let studentsOfGroup = [];
            registeredStudents.forEach(registeredStudent => {
                if (studentBelongsToGroup(registeredStudent)) {
                    let publishedStudent = StatsUtil.getStudentInGroupDataObject(registeredStudent, props.group);
                    studentsOfGroup.push(publishedStudent);
                }
            });
            setRegisteredStudentsFromGroup(studentsOfGroup);
        }
    }, [registeredStudents]);

    function studentBelongsToGroup(student) {
        if (props.group.universityCode) {
            if (student.universityCode === props.group.universityCode) {
                return student.groupIds && student.groupIds.includes(props.group.groupId);
            } else {
                return false;
            }
        } else {
            return student.groupIds && student.groupIds.includes(props.group.groupId);
        }
    }

    function getOptionName(optionId) {
        let correspondingOption = {};
        correspondingOption = groupCategories.find(option => option.id === optionId);
        return correspondingOption.name || 'CATEGORY_UNDEFINED';
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
        let categoryCopy = props.livestream.targetCategories ? props.livestream.targetCategories : {};
        categoryCopy[props.group.id] = localCategories;
        props.firebase.updateLivestreamCategories(props.livestream.id, categoryCopy).then(() => {
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
        <>
            <IconButton style={{position: 'absolute', top: '140px', right: '10px', zIndex: '2000'}}
                        onClick={() => setModalOpen(true)}>
                <EditIcon fontSize="large" color="inherit"/>
            </IconButton>
            <div style={{
                position: 'absolute',
                top: '210px',
                right: '10px',
                zIndex: '2000',
                fontWeight: '600'
            }}>{registeredStudentsFromGroup.length} students registered
            </div>
            <CSVLink data={registeredStudentsFromGroup} separator={";"}
                     filename={'Registered Students ' + props.livestream.company + ' ' + props.livestream.id + '.csv'}
                     style={{color: 'red'}}>
                <Button startIcon={<GetAppIcon/>} variant='outlined'
                        style={{position: 'absolute', top: '240px', right: '10px', zIndex: '2000'}}>
                    Registered Students
                </Button>
            </CSVLink>
            <Fragment>
                {!startDownloadingTalentPool || !hasDownloadedTalentPool ?
                    <div style={{position: 'absolute', top: '290px', right: '10px', zIndex: '2000'}}>
                        <Button variant='outlined' primary="true" onClick={() => setStartDownloadingTalentPool(true)}
                                disabled={startDownloadingTalentPool}
                                loading={startDownloadingTalentPool ? "true" : "false"}>{startDownloadingTalentPool ? 'Generating Talent Pool...' : 'Generate Talent Pool'}</Button>
                    </div> :
                    <CSVLink data={talentPool} separator={";"}
                             filename={'TalentPool ' + props.livestream.company + ' ' + props.livestream.id + '.csv'}
                             style={{color: 'red'}}>
                        <Button startIcon={<GetAppIcon/>} variant='outlined'
                                style={{position: 'absolute', top: '290px', right: '10px', zIndex: '2000'}}>
                            Talent Pool
                        </Button>
                    </CSVLink>
                }
            </Fragment>
            {
                props.isPastLivestream &&
                <Fragment>
                    {!startDownloadingReport || !hasDownloadedReport ?
                        <div style={{position: 'absolute', top: '340px', right: '10px', zIndex: '2000'}}>
                            <Button startIcon={startDownloadingReport && <CircularProgress size={20} color="inherit"/>}
                                    variant='outlined' onClick={() => setStartDownloadingReport(true)}
                                    disabled={startDownloadingReport}>{startDownloadingReport ? 'Generating Report...' : 'Generate Report'}</Button>
                        </div> :
                        <PDFDownloadLink fileName="somename.pdf"
                                         style={{position: 'absolute', top: '340px', right: '10px', zIndex: '2000'}}
                                         document={
                                             <LivestreamPdfReport group={props.group}
                                                                  livestream={props.livestream}
                                                                  studentStats={studentStats}
                                                                  speakers={livestreamSpeakers}
                                                                  overallRating={overallRating}
                                                                  contentRating={contentRating}
                                                                  totalStudentsInTalentPool={talentPoolForReport.length}
                                                                  totalViewerFromOutsideETH={participatingStudents.length - participatingStudentsFromGroup.length}
                                                                  totalViewerFromETH={participatingStudentsFromGroup.length}
                                                                  questions={questions} polls={polls} icons={icons}/>}>
                            {({blob, url, loading, error}) => (
                                <div>
                                    <Button variant='outlined' color='primary'>Download Report</Button>
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
            <GroupStreamCard
                livestreamId={props.livestream.id}
                livestream={props.livestream}
                user={props.user}
                userData={props.userData}
                fields={null}
                groupData={props.group}/>
        </>
    );
}

export default withFirebase(EnhancedGroupStreamCard);