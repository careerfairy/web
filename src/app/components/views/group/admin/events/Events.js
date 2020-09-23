import React, {Fragment, useState, useEffect} from 'react';
import {withFirebase} from 'context/firebase';
import {SizeMe} from 'react-sizeme';
import StackGrid from 'react-stack-grid';
import LivestreamCard from 'components/views/livestream-card/LivestreamCard';
import {useRouter} from 'next/router';
import AddIcon from "@material-ui/icons/Add";
import {Button, Menu, MenuItem, Typography} from "@material-ui/core";

const Events = (props) => {

    const router = useRouter();

    const [grid, setGrid] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [showAllLivestreams, setShowAllLivestreams] = useState(false);
    const [livestreams, setLivestreams] = useState([]);

    useEffect(() => {
        if (props.groupId) {
            const unsubscribe = props.firebase.listenToUpcomingLivestreams(querySnapshot => {
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
    }, [props.groupId]);

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

    if (showAllLivestreams) {
        livestreamElements = livestreams.map((livestream, index) => {
            return (
                <div key={index}>
                    <LivestreamCard livestream={livestream} user={props.user} userData={props.userData} fields={null}
                                    grid={grid} careerCenters={[]}/>
                </div>
            );
        });
    } else {
        livestreamElements = livestreams.slice(0, 2).map((livestream, index) => {
            return (
                <div key={index}>
                    <LivestreamCard livestream={livestream} user={props.user} userData={props.userData} fields={null}
                                    grid={grid} careerCenters={[]}/>
                </div>
            );
        });
    }

    return (
        <Fragment>
            <div style={{width: '100%', textAlign: 'left', margin: '0 0 20px 0'}}>
                <Typography variant="h4">Your Next Live Streams</Typography>
                <Button variant="contained"
                        color="primary"
                        size="medium"
                        style={{float: 'right', verticalAlign: 'middle', margin: '0'}}
                        onClick={handleClick}
                        endIcon={<AddIcon/>}>
                    New Live Stream
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => router.push('/group/' + props.groupId + '/admin/schedule-event')}>Send a
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