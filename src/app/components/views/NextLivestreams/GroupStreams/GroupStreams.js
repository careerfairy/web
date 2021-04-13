import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../context/firebase";
import {Grid, LinearProgress, Typography} from "@material-ui/core";
import GroupStreamCardV2 from "./groupStreamCard/GroupStreamCardV2";
import LazyLoad from 'react-lazyload'
import Spinner from "./groupStreamCard/Spinner";
import useInfiniteScrollClient from "../../../custom-hook/useInfiniteScrollClient";
import clsx from "clsx";
import {useAuth} from "../../../../HOCs/AuthProvider";

const gridItemHeight = 530
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
        zIndex: 101,
        marginBottom: 14
    },
    emptyMessage: {
        maxWidth: "400px",
        margin: "0 auto",
        color: "rgb(130,130,130)"
    },
    loaderWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh"
    },
    streamGridItem: {
        height: gridItemHeight,
        display: "flex"
    },
    dynamicHeight: {
        height: "auto"
    }
}));


const Wrapper = ({children, index, streamId}) => {

    return (index <= 2) ? (
        <>
            {children}
        </>
    ) : (
        <LazyLoad
            style={{flex: 1, display: "flex", width: "-webkit-fill-available"}}
            key={streamId}
            height={gridItemHeight}
            // unmountIfInvisible
            offset={[0, 0]}
            placeholder={<Spinner/>}>
            {children}
        </LazyLoad>
    )
}

const GroupStreams = ({
                          groupData,
                          livestreams,
                          mobile,
                          searching,
                          livestreamId,
                          careerCenterId,
                          listenToUpcoming,
                          selectedOptions,
                          isPastLivestreams,
                      }) => {
        const classes = useStyles()
        const {userData, authenticatedUser: user} = useAuth()
        const [globalCardHighlighted, setGlobalCardHighlighted] = useState(false)
        const searchedButNoResults = selectedOptions?.length && !searching && !livestreams?.length
        const [slicedLivestreams, loadMoreLivestreams, hasMoreLivestreams, totalLivestreams] = useInfiniteScrollClient(livestreams, 6, 3);

        const handleScroll = () => {
            const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight * 0.6
            if (bottom && hasMoreLivestreams) {
                loadMoreLivestreams()
            }
        };

        useEffect(() => {
            window.addEventListener('scroll', handleScroll, {
                passive: true
            });

            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }, [totalLivestreams, slicedLivestreams]);

        useEffect(() => {
            if (globalCardHighlighted) {
                setGlobalCardHighlighted(false)
            }
        }, [groupData])

        const renderStreamCards = slicedLivestreams?.map((livestream, index) => {
            if (livestream) {
                return (
                    <Grid
                        className={clsx(classes.streamGridItem, {
                            [classes.dynamicHeight]: mobile
                        })}
                        key={livestream.id} xs={12} sm={12} md={6}
                        lg={4} xl={4} item>
                        <Wrapper
                            index={index}
                            streamId={livestream.id}
                        >
                            <GroupStreamCardV2
                                mobile={mobile}
                                isPastLivestreams={isPastLivestreams}
                                setGlobalCardHighlighted={setGlobalCardHighlighted}
                                globalCardHighlighted={globalCardHighlighted}
                                groupData={groupData}
                                listenToUpcoming={listenToUpcoming}
                                careerCenterId={careerCenterId}
                                livestreamId={livestreamId}
                                user={user} userData={userData}
                                id={livestream.id}
                                key={livestream.id}
                                livestream={livestream}
                            />
                        </Wrapper>
                    </Grid>
                )
            }
        })

        return (
            <Grid item xs={12}>
                <Grid container spacing={mobile ? 2 : 4}>
                    {groupData.id || listenToUpcoming ? (searching ?
                        <Grid md={12} lg={12} xl={12} item className={classes.loaderWrapper}>
                            <LinearProgress style={{width: "80%"}} color="primary"/>
                        </Grid>
                        :
                        livestreams.length ?
                            renderStreamCards
                            :
                            <Grid sm={12} xs={12} md={12} lg={12} xl={12} item className={classes.loaderWrapper}>
                                <Typography className={classes.emptyMessage} align="center" variant="h5"
                                            style={{marginTop: 100}}>{searchedButNoResults ? "We couldn't find anything... 😕" :
                                    <strong>{groupData.universityName} currently has
                                        no {isPastLivestreams ? "past" : "scheduled"} live streams</strong>}</Typography>
                            </Grid>)
                        : null}
                </Grid>
            </Grid>
        );
    }
;

export default withFirebase(GroupStreams);
