import React, {Fragment, useState, useEffect} from 'react';
import {withFirebase} from 'context/firebase';
import AddIcon from "@material-ui/icons/Add";
import EditIcon from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';
import {Box, Button, CardMedia, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, IconButton, InputLabel, Menu, MenuItem, Select, Typography} from "@material-ui/core";
import GroupStreamCard from 'components/views/NextLivestreams/GroupStreams/GroupStreamCard';
import { CSVLink } from "react-csv";

const EnhancedGroupStreamCard = (props) => {

    const [modalOpen, setModalOpen] = useState(false);
    const [localCategories, setLocalCategories] = useState([]);
    const [groupCategories, setGroupCategories] = useState([]);
    const [newCategory, setNewCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [registeredStudents, setRegisteredStudents] = useState([]);

    useEffect(() => {
        if (props.livestream && props.livestream.targetCategories && props.livestream.targetCategories[props.group.id] && modalOpen) {
            setLocalCategories(props.livestream.targetCategories[props.group.id])
        }
    },[props.livestream, modalOpen])

    useEffect(() => {
        if (props.group && props.group.categories) {
            let fieldOfStudyCategories = props.group.categories.find(category => category.name?.toLowerCase() === "field of study");
            setGroupCategories(fieldOfStudyCategories.options);
        }
    },[props.group])

    useEffect(() => {
        if (props.livestream && props.group) {
            props.firebase.getLivestreamRegisteredStudents(props.livestream.id).then(querySnapshot => {
                let registeredStudents = [];
                querySnapshot.forEach(doc => {
                    let student = doc.data();
                    let publishedStudent = {
                        'First Name': student.firstName,
                        'Last Name': student.lastName,
                        'Email': doc.id,
                        'University': getUniversityValue(student),
                        'Study Subject': getUniversitySubjectValue(student),
                        'Study Level': getUniversityLevelValue(student),
                    };
                    registeredStudents.push(publishedStudent);
                });
                setRegisteredStudents(registeredStudents);
            })
        }      
    }, [props.livestream]);

    useEffect(() => {
        if (props.livestream) {
            props.firebase.getLivestreamTalentPoolMembers(props.livestream.id).then(querySnapshot => {
                let registeredStudents = [];
                querySnapshot.forEach(doc => {
                    let student = doc.data();
                    let publishedStudent = {
                        'First Name': student.firstName,
                        'Last Name': student.lastName,
                        'Email': doc.id,
                        'Study Subject': getUniversitySubjectValue(student),
                        'Study Level': getUniversityLevelValue(student),
                    };
                    registeredStudents.push(publishedStudent);
                });
                setTalentPool(registeredStudents);
            })
        }      
    }, [props.livestream]);

    function getUniversityValue(student) {
        if (student.university) {
            return student.university;
        }
    }

    function getUniversitySubjectValue(student) {
        if (student.university) {

        }
    }

    function getUniversityLevelValue(student) {
        
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
        let categoryCopy = props.livestream.targetCategories;
        categoryCopy[props.group.id] = localCategories;
        setLoading(true);
        props.firebase.updateLivestreamCategories(props.livestream.id, categoryCopy).then(() => {
            setLoading(false);
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
            <IconButton style={{ position: 'absolute', top: '190px', right: '10px', zIndex: '2000' }}>
                <GetAppIcon fontSize="large" color="inherit">
                    <CSVLink data={registeredStudents} filename={'livestream' + livestream.id + '.csv'} style={{ color: 'white' }}></CSVLink>
                </GetAppIcon>
            </IconButton>
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