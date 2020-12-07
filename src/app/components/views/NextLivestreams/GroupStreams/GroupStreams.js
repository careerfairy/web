import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../context/firebase";
import GroupStreamCard from "./GroupStreamCard";
import {Typography, LinearProgress, Box, Grid} from "@material-ui/core";
import GroupStreamCardV2 from "./groupStreamCard/GroupStreamCardV2";

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
    gridContainer: {
        // marginTop: theme.spacing(2)
    },
    loaderWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
}));


const GroupStreams = ({
                          groupData,
                          userData,
                          user,
                          livestreams,
                          mobile,
                          searching,
                          livestreamId,
                          careerCenterId,
                          alreadyJoined,
                          listenToUpcoming,
                          selectedOptions,
                          hasCategories
                      }) => {
        const classes = useStyles()
        const searchedButNoResults = selectedOptions.length && !searching && !livestreams.length

        const renderStreamCards = livestreams?.map((livestream, index) => {
            if (livestream) {
                return (
                    <Grid key={livestream.id} xs={12} sm={6} md={6}
                          lg={6} xl={3} item>
                        <GroupStreamCardV2
                            index={index}
                            mobile={mobile}
                            hasCategories={hasCategories}
                            groupData={groupData}
                            listenToUpcoming={listenToUpcoming}
                            careerCenterId={careerCenterId}
                            livestreamId={livestreamId}
                            user={user} userData={userData} fields={null}
                            careerCenters={[]}
                            id={livestream.id}
                            key={livestream.id}
                            livestream={livestream}
                        />
                    </Grid>
                )
            }
        })

        return (
            <Grid item xs={12} sm={12} md={hasCategories ? 8 : 12} lg={hasCategories ? 8 : 12} xl={hasCategories ? 8 : 12}>
                <Grid container spacing={2}>
                    {groupData.id || listenToUpcoming ? (searching ?
                        <Grid item className={classes.loaderWrapper}>
                            <LinearProgress style={{width: "80%"}} color="primary"/>
                        </Grid>
                        :
                        livestreams.length ?
                                renderStreamCards
                            :
                            <Grid item className={classes.loaderWrapper}>
                                <Typography className={classes.emptyMessage} align="center" variant="h5"
                                            style={{marginTop: 100}}>{searchedButNoResults ? "We couldn't find anything... 😕" :
                                    <strong>{groupData.universityName} currently has no scheduled live
                                        streams</strong>}</Typography>
                            </Grid>)
                        : null}
                </Grid>
            </Grid>
        );
    }
;

export default withFirebase(GroupStreams);
