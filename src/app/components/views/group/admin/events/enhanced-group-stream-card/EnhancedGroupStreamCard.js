import React, {Fragment, useState, useEffect} from 'react';
import {withFirebase} from 'context/firebase';
import GetAppIcon from "@material-ui/icons/GetApp";
import EditIcon from '@material-ui/icons/Edit';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import {Box, Button, CardMedia, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, IconButton, InputLabel, Menu, MenuItem, Select, Typography} from "@material-ui/core";
import GroupStreamCard from 'components/views/NextLivestreams/GroupStreams/GroupStreamCard';
import { CSVLink } from "react-csv";
import StatsUtil from 'data/util/StatsUtil';
import { PDFDownloadLink, Document, Page, View, Text } from '@react-pdf/renderer';
import { window } from 'global';
import LivestreamPdfReport from './LivestreamPdfReport';

const EnhancedGroupStreamCard = (props) => {

    const [modalOpen, setModalOpen] = useState(false);
    const [localCategories, setLocalCategories] = useState([]);
    const [groupCategories, setGroupCategories] = useState([]);
    const [allGroups, setAllGroups] = useState([]);

    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [registeredStudentsFromGroup, setRegisteredStudentsFromGroup] = useState([]);
    const [studentStats, setStudentStats] = useState(null);
    const [talentPool, setTalentPool] = useState([]);
    const [download, setDownload] = useState(false);

    useEffect(() => {
        if (props.livestream && props.livestream.targetCategories && props.livestream.targetCategories[props.group.id] && modalOpen) {
            setLocalCategories(props.livestream.targetCategories[props.group.id])
        }
    },[props.livestream, modalOpen])

    useEffect(() => {
        if (props.group && props.group.categories) {
            let fieldOfStudyCategories = props.group.categories.find(category => category.name?.toLowerCase() === "field of study");
            if (fieldOfStudyCategories && fieldOfStudyCategories.options) {
                setGroupCategories(fieldOfStudyCategories.options);
            }
        }
    },[props.group])

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
            registeredStudents.forEach( registeredStudent => {
                if (studentBelongsToGroup(registeredStudent)) {
                    let publishedStudent = StatsUtil.getStudentInGroupDataObject(registeredStudent, props.group);
                    studentsOfGroup.push(publishedStudent);
                }
            });
            setRegisteredStudentsFromGroup(studentsOfGroup);
        }      
    }, [registeredStudents]);

    useEffect(() => {
        if (registeredStudents && registeredStudents.length) {
            let listOfStudents = registeredStudents.filter( student => studentBelongsToGroup(student));
            let stats = StatsUtil.getRegisteredStudentsStats(listOfStudents, props.group);
            setStudentStats(stats);
        }      
    }, [registeredStudents]);

    useEffect(() => {
        if (props.livestream && allGroups.length && registeredStudentsFromGroup) {
            props.firebase.getLivestreamTalentPoolMembers(props.livestream.companyId).then(querySnapshot => {
                let registeredStudents = [];
                querySnapshot.forEach(doc => {
                    let element = doc.data();
                    if (registeredStudentsFromGroup.some( student => student.id === doc.id)) {
                        let publishedStudent = StatsUtil.getStudentInGroupDataObject(element, props.group);
                        registeredStudents.push(publishedStudent);
                    } else {
                        let publishedStudent = StatsUtil.getStudentOutsideGroupDataObject(element, props.group, allGroups);
                        registeredStudents.push(publishedStudent);
                    }    
                });
                setTalentPool(registeredStudents);
            })
        }      
    }, [props.livestream, allGroups, registeredStudentsFromGroup]);

    function studentBelongsToGroup(student) {
        if (student.universityCode) {
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
        correspondingOption = groupCategories.find( option => option.id === optionId );
        return correspondingOption.name || 'CATEGORY_UNDEFINED';
    }

    function addElement(optionId) {
        if (localCategories.indexOf(optionId) < 0) {
            setLocalCategories([...localCategories, optionId])
        }
    }

    function removeElement(optionId) {
        const filteredOptions = localCategories.filter( option => option !== optionId);
        setLocalCategories(filteredOptions);
    }

    function updateLivestreamCategories() {
        let categoryCopy = props.livestream.targetCategories ? props.livestream.targetCategories : {};
        categoryCopy[props.group.id] = localCategories;
        props.firebase.updateLivestreamCategories(props.livestream.id, categoryCopy).then(() => {
            setModalOpen(false);
        });
    }
    
    let categoryElements = localCategories.map( category => {
        return (
            <Chip
                size={"medium"}
                variant={"outlined"}
                onDelete={() => removeElement(category)}
                label={getOptionName(category)} /> 
        );
    });

    let menuItems = groupCategories.map( group => {
        return (
            <MenuItem value={group.id}>{group?.name}</MenuItem>
        );
    });

    return (
        <>
            <IconButton style={{ position: 'absolute', top: '140px', right: '10px', zIndex: '2000' }} onClick={() => setModalOpen(true)}>
                <EditIcon fontSize="large" color="inherit"/>
            </IconButton>
            <CSVLink data={registeredStudentsFromGroup} filename={'livestream' + props.livestream.id + '.csv'} style={{ color: 'red' }}>
                <IconButton style={{ position: 'absolute', top: '190px', right: '10px', zIndex: '2000' }}>
                    <GetAppIcon fontSize="large" color="inherit"/>
                </IconButton>
            </CSVLink>
            <CSVLink data={talentPool} filename={'talentPool' + props.livestream.id + '.csv'} style={{ color: 'red' }}>
                <IconButton style={{ position: 'absolute', top: '240px', right: '10px', zIndex: '2000' }}>
                    <HowToRegIcon fontSize="large" color="inherit"/>
                </IconButton>
            </CSVLink>
            <div style={{ display: download ? 'none' : 'block', position: 'absolute', top: '290px', right: '10px', zIndex: '2000' }}>
                <Button primary onClick={() => setDownload(true)}>Request</Button>
            </div>
            <PDFDownloadLink document={download ? <LivestreamPdfReport livestream={props.livestream} studentStats={studentStats}/> : null} fileName="somename.pdf"  style={{ position: 'absolute', top: '290px', right: '10px', zIndex: '2000' }}>
                {({ blob, url, loading, error }) => (
                    <div>
                        <Button primary >Download</Button>
                    </div>
                )}
            </PDFDownloadLink> 
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle align="center">Update Target Groups</DialogTitle>
                <DialogContent>
                    <DialogContentText align="left">
                    <FormControl variant="outlined" fullWidth style={{ marginBottom: "10px"}}>
                        <InputLabel>Add a Target Group</InputLabel>
                        <Select
                        value={null}
                        placeholder="Select a target group"
                        onChange={(e) => addElement(e.target.value) }
                        label="New target group"
                        >
                        { menuItems }
                        </Select>
                    </FormControl>
                        { categoryElements }
                    </DialogContentText>
                    <Box>
                    </Box>
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
            <GroupStreamCard livestream={props.livestream} user={props.user} userData={props.userData} fields={null}
                grid={props.grid} groupData={props.group}/>
        </>
    );
}

export default withFirebase(EnhancedGroupStreamCard);