import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../data/firebase";
import GroupStreamCard from "./GroupStreamCard";
import {Typography, LinearProgress, Box} from "@material-ui/core";
import {SizeMe} from "react-sizeme";
import StackGrid from "react-stack-grid";

const useStyles = makeStyles((theme) => ({
    root: {
        flex: 1,
        paddingTop: 0,
        display: "flex",
        flexDirection: "column",
    },
}));

const GroupStreams = ({groupData, userData, user, livestreams, mobile, searching, livestreamId, setStreamRef}) => {

        const classes = useStyles()
        const [grid, setGrid] = useState(null);

        useEffect(() => {
            if (grid) {
                setTimeout(() => {
                    grid.updateLayout();
                }, 10);
            }
        }, [grid, livestreams]);

        const renderStreamCards = livestreams?.map((livestream, index) => {
            return <GroupStreamCard
                setStreamRef={setStreamRef}
                index={index}
                livestreamId={livestreamId}
                user={user} userData={userData} fields={null}
                grid={grid} careerCenters={[]}
                id={livestream.id}
                key={livestream.id} livestream={livestream}
            />
        })

        return (
            <div style={{padding: mobile ? 0 : "1rem"}} className={classes.root}>
                {groupData.id ? (searching ?
                    <Box display="flex" justifyContent="center" mt={5}>
                        <LinearProgress style={{width: "80%"}} color="primary"/>
                    </Box>
                    :
                    renderStreamCards.length ?
                        <SizeMe>{({size}) => (
                            <StackGrid
                                style={{marginTop: 10}}
                                duration={0}
                                columnWidth={(size.width <= 768 ? '100%' : '50%')}
                                gutterWidth={20}
                                gutterHeight={20}
                                gridRef={grid => setGrid(grid)}>
                                {renderStreamCards}
                            </StackGrid>
                        )}</SizeMe>
                        : <Typography align="center" variant="h5"
                                      style={{marginTop: mobile ? 100 : 0}}><strong>{groupData.universityName} currently has
                            no scheduled
                            livestreams</strong></Typography>)
                    : <Typography variant="h6" style={{marginTop: 10}}>Chose a Group</Typography>}
            </div>
        );
    }
;

export default withFirebase(GroupStreams);
