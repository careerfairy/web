import React from 'react';
import {Box, Container, Grid, Grow, withWidth} from "@material-ui/core";
import GroupCategories from "../GroupCategories/GroupCategories";
import GroupStreams from "../GroupStreams/GroupStreams";
import {useTheme} from "@material-ui/core/styles";

const DesktopFeed = ({
                         groupData,
                         hasCategories,
                         userData,
                         alreadyJoined,
                         handleToggleActive,
                         mobile,
                         user,
                         livestreams,
                         searching,
                         livestreamId,
                         careerCenterId,
                         listenToUpcoming,
                         selectedOptions,
                         width,
                         isPastLivestreams,
                     }) => {
    const theme = useTheme()
    return (
        <Grow in>
            <Container maxWidth="lg" disableGutters style={{flex: 1, display: "flex"}}>
                <Grid
                    container
                    spacing={4}
                    style={{margin: theme.spacing(1)}}
                >
                    <GroupCategories livestreams={livestreams}
                                     mobile={mobile}
                                     user={user}
                                     hasCategories={hasCategories}
                                     handleToggleActive={handleToggleActive}
                                     userData={userData}
                                     alreadyJoined={alreadyJoined}
                                     groupData={groupData}/>
                    <GroupStreams
                        user={user}
                        mobile={false}
                        isPastLivestreams={isPastLivestreams}
                        width={width}
                        hasCategories={hasCategories}
                        livestreamId={livestreamId}
                        listenToUpcoming={listenToUpcoming}
                        careerCenterId={careerCenterId}
                        selectedOptions={selectedOptions}
                        searching={searching}
                        alreadyJoined={alreadyJoined}
                        livestreams={livestreams}
                        userData={userData}
                        groupData={groupData}
                    />
                </Grid>
            </Container>
        </Grow>
    );
};

export default withWidth()(DesktopFeed);
