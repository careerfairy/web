import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../context/firebase";
import GroupStreamCard from "./GroupStreamCard";
import {Typography, LinearProgress, Box, Button, Card} from "@material-ui/core";
import {SizeMe} from "react-sizeme";
import StackGrid from "react-stack-grid";
import {useRouter} from "next/router";
import GroupJoinModal from "../../profile/GroupJoinModal";
import LazyLoad from "react-lazyload";
import Skeleton from "@material-ui/lab/Skeleton";

const useStyles = makeStyles((theme) => ({
    root: {
        flex: 1,
        paddingTop: 0,
        display: "flex",
        flexDirection: "column",
    },
    followButton: {
        position: "sticky",
        top: 165,
        zIndex: 20
    }
}));

const PlaceHolder = () => {
    return (
        <div>
            <Skeleton width="100%" variant="text"/>
            <Skeleton variant="circle" width={40} height={40}/>
            <Skeleton variant="rect" width="100%" height={550}/>
        </div>
    )
}


const GroupStreams = ({groupData, userData, user, livestreams, mobile, searching, livestreamId, careerCenterId, alreadyJoined, listenToUpcoming}) => {
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
                return router.push({pathname: "/login", query: {absolutePath}})
            }
        }

        const renderStreamCards = livestreams?.map((livestream, index) => {
            if (livestream) {
                return (
                    <LazyLoad key={livestream.id}
                              offset={[-100, 100]}
                              placeholder={<PlaceHolder/>}>
                        <GroupStreamCard
                            index={index}
                            groupData={groupData}
                            listenToUpcoming={listenToUpcoming}
                            careerCenterId={careerCenterId}
                            livestreamId={livestreamId}
                            user={user} userData={userData} fields={null}
                            grid={grid} careerCenters={[]}
                            id={livestream.id}
                            key={livestream.id} livestream={livestream}
                        />
                    </LazyLoad>
                )
            }
        })

        return (
            <div style={{padding: mobile ? 0 : "1rem"}} className={classes.root}>
                {!userData?.groupIds?.includes(groupData.groupId) && !mobile && !listenToUpcoming &&
                <Button className={classes.followButton} size="large" onClick={handleJoin} variant="contained" fullWidth
                        color="primary" align="center">
                    <Typography variant="h6">Start Following {groupData.universityName}</Typography>
                </Button>}
                {groupData.id || listenToUpcoming ? (searching ?
                    <Box display="flex" justifyContent="center" mt={5}>
                        <LinearProgress style={{width: "80%"}} color="primary"/>
                    </Box>
                    :
                    renderStreamCards.length ?
                        <SizeMe noPlaceholder={true}>{({size}) => (
                            <StackGrid
                                style={{marginTop: 10}}
                                columnWidth={(size.width <= 768 ? '100%' : '50%')}
                                gutterWidth={20}
                                duration={0}
                                monitorImagesLoaded
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
