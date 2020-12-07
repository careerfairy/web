import React from 'react';
import {Box, Container, Grid} from "@material-ui/core";
import GroupCategories from "../GroupCategories/GroupCategories";
import GroupStreams from "../GroupStreams/GroupStreams";
import {useTheme} from "@material-ui/core/styles";


const DesktopFeed = ({groupData, hasCategories, userData, alreadyJoined, handleToggleActive, mobile, user, livestreams, searching, livestreamId, careerCenterId, listenToUpcoming, selectedOptions}) => {
    const theme = useTheme()
    return (
        <Container style={{flex: 1, display: "flex", height: "50vh", border: "1px solid green"}}>
            <Grid container spacing={2} style={{margin: theme.spacing(1), border: "1px solid blue", height: "fit-content"}}>
            {hasCategories ?
                <GroupCategories livestreams={livestreams}
                                 mobile={mobile}
                                 user={user}
                                 hasCategories={hasCategories}
                                 handleToggleActive={handleToggleActive}
                                 userData={userData}
                                 alreadyJoined={alreadyJoined}
                                 groupData={groupData}/> : null}
            <GroupStreams
                user={user}
                mobile={false}
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
    );
};

export default DesktopFeed;
