import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../context/firebase";
import GroupStreamCard from "./GroupStreamCard";
import {Typography, LinearProgress, Box, Button, Card} from "@material-ui/core";
import {SizeMe} from "react-sizeme";
import StackGrid from "react-stack-grid";
import Link from "next/link";
import {useRouter} from "next/router";
import GroupJoinModal from "../../profile/GroupJoinModal";

const useStyles = makeStyles((theme) => ({
    root: {
        flex: 1,
        paddingTop: 0,
        display: "flex",
        flexDirection: "column",
    },
}));


const GroupStreams = ({groupData, userData, user, livestreams, mobile, searching, livestreamId, careerCenterId, alreadyJoined}) => {
        const classes = useStyles()
        const router = useRouter()
        const absolutePath = router.asPath
        const [grid, setGrid] = useState(null);
        const [openJoinModal, setOpenJoinModal] = useState(false);

        useEffect(() => {
            if (grid) {
                setTimeout(() => {
                    grid.updateLayout();
                }, 10);
            }
        }, [grid, livestreams]);


        const handleCloseJoinModal = () => {
            setOpenJoinModal(false);
        };
        const handleOpenJoinModal = () => {
            setOpenJoinModal(true);
        };

        const handleJoin = () => {
            if (userData) {
                handleOpenJoinModal()
            } else {
                return router.push({pathname: "/login", query: absolutePath})
            }
        }

        const renderStreamCards = livestreams?.map((livestream, index) => {
            if (livestream) {
                return (
                    <GroupStreamCard
                        index={index}
                        groupData={groupData}
                        careerCenterId={careerCenterId}
                        livestreamId={livestreamId}
                        user={user} userData={userData} fields={null}
                        grid={grid} careerCenters={[]}
                        id={livestream.id}
                        key={livestream.id} livestream={livestream}
                    />

                )
            }
        })

        return (
            <div style={{padding: mobile ? 0 : "1rem"}} className={classes.root}>
                {!alreadyJoined && groupData.universityName &&
                <Button onClick={handleJoin} variant="contained" fullWidth color="primary" align="center">
                    Start Following {groupData.universityName}
                </Button>}
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
                    : null}
                <GroupJoinModal
                    open={openJoinModal}
                    group={groupData}
                    alreadyJoined={alreadyJoined}
                    userData={userData}
                    closeModal={handleCloseJoinModal}
                />
            </div>
        );
    }
;

export default withFirebase(GroupStreams);
