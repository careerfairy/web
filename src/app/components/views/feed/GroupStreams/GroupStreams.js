import React, {Fragment, useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../data/firebase";
import GroupStreamCard from "./GroupStreamCard";
import {Typography} from "@material-ui/core";
import LivestreamCard from "../../livestream-card/LivestreamCard";
import {SizeMe} from "react-sizeme";
import StackGrid from "react-stack-grid";

const useStyles = makeStyles((theme) => ({
    root: {
        flex: 1,
        padding: theme.spacing(2),
        border: "1px solid blue",
        height: "100%",
    },
}));

const GroupStreams = ({groupData, firebase, userData, user}) => {

        const classes = useStyles()
        const [livestreams, setLivestreams] = useState([])
        const [searching, setSearching] = useState(false)
        const [grid, setGrid] = useState(null);


        useEffect(() => {
            if (grid) {
                setTimeout(() => {
                    grid.updateLayout();
                }, 10);
            }
        }, [grid, livestreams]);

        useEffect(() => {
            if (groupData && groupData.universityId) {
                setSearching(true)
                const unsubscribe = firebase.listenToLiveStreamsByUniversityId(groupData.universityId, querySnapshot => {
                    setSearching(false);
                    let livestreams = [];
                    querySnapshot.forEach(doc => {
                        let livestream = doc.data();
                        livestream.id = doc.id;
                        livestreams.push(livestream);
                    })
                    setLivestreams(livestreams);
                    setSearching(false)
                })
                return () => unsubscribe()
            }
        }, [groupData])

        const renderStreamCards = livestreams.map(livestream => {
            return <GroupStreamCard
                user={user} userData={userData} fields={null}
                grid={grid} careerCenters={[]}
                key={livestream.id} livestream={livestream}
            />
        })

        return (
            <div className={classes.root}>
                {groupData.id ? (renderStreamCards.length ?
                    <SizeMe>{({size}) => (
                        <StackGrid
                            style={{marginTop: 20}}
                            duration={0}
                            columnWidth={(size.width <= 768 ? '100%' : '50%')}
                            gutterWidth={20}
                            gutterHeight={20}
                            gridRef={grid => setGrid(grid)}>
                            {renderStreamCards}
                        </StackGrid>
                    )}</SizeMe>
                    : <Typography>No Scheduled Livestreams...</Typography>)
                    : <Typography>Chose a Group</Typography>}
            </div>
        );
    }
;

export default withFirebase(GroupStreams);
