import React, {Fragment, useState, useEffect} from 'react';
import {withFirebase} from 'context/firebase';
import {SizeMe} from 'react-sizeme';
import StackGrid from 'react-stack-grid';
import LivestreamCard from 'components/views/livestream-card/LivestreamCard';
import {useRouter} from 'next/router';
import AddIcon from "@material-ui/icons/Add";
import EditIcon from '@material-ui/icons/Edit';
import {Box, Button, CardMedia, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputLabel, Menu, MenuItem, Select, Typography} from "@material-ui/core";

const Events = (props) => {

    const router = useRouter();

    const [grid, setGrid] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [livestreams, setLivestreams] = useState([]);

    useEffect(() => {
        if (props.group.id) {
            const unsubscribe = props.firebase.listenToLiveStreamsByGroupId(props.group.id, querySnapshot => {
                var livestreams = [];
                querySnapshot.forEach(doc => {
                    let livestream = doc.data();
                    livestream.id = doc.id;
                    livestreams.push(livestream);
                });
                setLivestreams(livestreams);
            }, error => {
                console.log(error);
            });
            return () => unsubscribe();
        }
    }, [props.group.id]);

    useEffect(() => {
        if (grid) {
            setTimeout(() => {
                grid.updateLayout();
            }, 10);
        }
    }, [grid, livestreams, props.menuItem]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    let livestreamElements = [];

    const EnhancedCard = (props) => {

        const [modalOpen, setModalOpen] = useState(false);
        const [localCategories, setLocalCategories] = useState([]);
        const [groupCategories, setGroupCategories] = useState([]);
        const [newCategory, setNewCategory] = useState(null);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            if (props.livestream && props.livestream.targetCategories[props.group.id] && modalOpen) {
                setLocalCategories(props.livestream.targetCategories[props.group.id])
            }
        },[props.livestream, modalOpen])

        useEffect(() => {
            if (props.group && props.group.categories) {
                let fieldOfStudyCategories = props.group.categories.find(category => category.name.toLowerCase() === "field of study");
                setGroupCategories(fieldOfStudyCategories.options);
            }
        },[props.group])

        function getOptionName(optionId) {
            let correspondingOption = {};
            correspondingOption = groupCategories.find( option => option.id === optionId );
            return correspondingOption;
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
                    label={getOptionName(category).name} /> 
            );
        });

        let menuItems = groupCategories.map( group => {
            return (
                 <MenuItem value={group.id}>{group.name}</MenuItem>
            );
        });

        return (
            <>
                <IconButton style={{ position: 'absolute', top: '100px', right: '10px', zIndex: '2000' }} onClick={() => setModalOpen(true)}>
                    <EditIcon fontSize="large" color="inherit"/>
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
                <LivestreamCard livestream={props.livestream} user={props.user} userData={props.userData} fields={null}
                    grid={props.grid} careerCenters={[]}/>
            </>
        );
    }

    livestreamElements = livestreams.map((livestream, index) => {
        return (
            <div key={index} style={{ position: 'relative' }}>
                <EnhancedCard livestream={livestream} {...props} fields={null} grid={grid} careerCenters={[]}/>
            </div>
        );
    });

    return (
        <Fragment>
            <div style={{width: '100%', textAlign: 'left', margin: '0 0 20px 0'}}>
                <Typography variant="h4">Your Next Live Streams</Typography>
                {/* <Button variant="contained"
                        color="primary"
                        size="medium"
                        style={{float: 'right', verticalAlign: 'middle', margin: '0'}}
                        onClick={handleClick}
                        endIcon={<AddIcon/>}>
                    New Live Stream
                </Button> */}
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => router.push('/group/' + props.group.id + '/admin/schedule-event')}>Send a
                        Company Request</MenuItem>
                    <MenuItem onClick={handleClose}>Schedule a Live Stream</MenuItem>
                </Menu>
            </div>
            <SizeMe>{({size}) => (
                <StackGrid
                    style={{marginTop: 20}}
                    duration={0}
                    columnWidth={(size.width <= 768 ? '100%' : '50%')}
                    gutterWidth={20}
                    gutterHeight={20}
                    gridRef={grid => setGrid(grid)}>
                    {livestreamElements}
                </StackGrid>
            )}</SizeMe>
            <style jsx>{`
                .hidden {
                    display: none;
                }
                
                .white-box {
                    background-color: white;
                    box-shadow: 0 0 5px rgb(190,190,190);
                    border-radius: 5px;
                    padding: 20px;
                    margin: 10px;
                    text-align: left;
                }

                .white-box-label {
                    font-size: 0.8em;
                    font-weight: 700;
                    color: rgb(160,160,160);
                    margin: 5px 0 5px 0; 
                }

                .white-box-title {
                    font-size: 1.2em;
                    font-weight: 700;
                    color: rgb(80,80,80);
                }

                .sublabel {
                    text-align: left;
                    display: inline-block;
                    vertical-align: middle;
                    margin: 9px 0;
                    color: rgb(80,80,80);
                }
            `}</style>
        </Fragment>
    );
}

export default withFirebase(Events);