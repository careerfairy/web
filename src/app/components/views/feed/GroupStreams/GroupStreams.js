import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../data/firebase";
import GroupStreamCard from "./GroupStreamCard";
import {Typography} from "@material-ui/core";
import {SizeMe} from "react-sizeme";
import StackGrid from "react-stack-grid";

const useStyles = makeStyles((theme) => ({
    root: {
        flex: 1,
        paddingTop: 0,
        height: "100%",
    },
}));

const GroupStreams = ({groupData, userData, user, livestreams, mobile}) => {

        const classes = useStyles()
        const [grid, setGrid] = useState(null);


        useEffect(() => {
            if (grid) {
                setTimeout(() => {
                    grid.updateLayout();
                }, 10);
            }
        }, [grid, livestreams]);

        const renderStreamCards = livestreams?.map(livestream => {
            return <GroupStreamCard
                user={user} userData={userData} fields={null}
                grid={grid} careerCenters={[]}
                key={livestream.id} livestream={livestream}
            />
        })

        return (
            <div style={{padding: mobile? 0 : "1rem"}} className={classes.root}>
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
                    : <Typography variant="h6" style={{marginTop: 10}}>No Scheduled Livestreams...</Typography>)
                    : <Typography variant="h6"  style={{marginTop: 10}}>Chose a Group</Typography>}
            </div>
        );
    }
;

export default withFirebase(GroupStreams);
