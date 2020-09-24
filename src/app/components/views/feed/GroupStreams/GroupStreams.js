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
        const [page, setPage] = useState(0)
        const [isBottom, setIsBottom] = useState(false);
        const [openJoinModal, setOpenJoinModal] = useState(false);
        const [localLiveStreams, setLocalLivestreams] = useState([])

        useEffect(() => {
            if (grid) {
                setTimeout(() => {
                    grid.updateLayout();
                }, 10);
            }
        }, [grid, livestreams]);

        useEffect(() => {
            console.log("updated livestreams")
            if (livestreams) {
                if (localLiveStreams.length === 0) {
                    const initialGroups = livestreams.slice(0, 10)
                    setLocalLivestreams(initialGroups)
                }
            }
        }, [livestreams])

        useEffect(() => {
            window.addEventListener('scroll', throttle(handleScroll, 500));
            return () => window.removeEventListener('scroll', throttle(handleScroll, 500));
        }, []);

        useEffect(() => {
            console.log("isBottom");
            if (isBottom) {
                addItems();
            }
        }, [isBottom]);


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

        function handleScroll() {
            const scrollTop = (document.documentElement
                && document.documentElement.scrollTop)
                || document.body.scrollTop;
            const scrollHeight = (document.documentElement
                && document.documentElement.scrollHeight)
                || document.body.scrollHeight;
            console.log("scrollTop", scrollTop)
            console.log("scrollHeight", scrollHeight)
            console.log("window.innerHeight", window.innerHeight)
            if (scrollTop + window.innerHeight + 50 >= (scrollHeight / 2)) {
                setIsBottom(true);
            }
        }

        const addItems = () => {
            if (livestreams.length !== 0) {
                console.log("setting local groups");
                setLocalLivestreams(prevState =>
                    prevState.concat(
                        livestreams.slice(
                            (page + 1) * 10,
                            (page + 1) * 10 + 10,
                        ),
                    ),
                );
                setPage(prevState => prevState + 1);
                setIsBottom(false);
            }
        };

        function throttle(fn, wait) {
            var time = Date.now();
            return function () {
                if ((time + wait - Date.now()) < 0) {
                    fn();
                    time = Date.now();
                }
            }
        }

        const renderStreamCards = localLiveStreams?.map((livestream, index) => {
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
