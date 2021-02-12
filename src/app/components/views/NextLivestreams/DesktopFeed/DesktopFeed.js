import React from 'react';
import { Box, Container, Grid, withWidth } from "@material-ui/core";
import GroupCategories from "../GroupCategories/GroupCategories";
import GroupStreams from "../GroupStreams/GroupStreams";
import {useTheme} from "@material-ui/core/styles";


const DesktopFeed = ({groupData, hasCategories, userData, alreadyJoined, handleToggleActive, mobile, user, livestreams, searching, livestreamId, careerCenterId, listenToUpcoming, selectedOptions, width}) => {
    const theme = useTheme()
    return (
        <Container maxWidth="lg" disableGutters style={{flex: 1, display: "flex", height: "50vh"}}>
            <Grid
                container
                spacing={4}
                style={{margin: theme.spacing(1), height: "fit-content"}}
            >
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
    );
};

export default withWidth()(DesktopFeed);
