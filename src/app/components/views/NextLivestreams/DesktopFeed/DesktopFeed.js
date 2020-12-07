import React from 'react';
import {Box, Container, Grid} from "@material-ui/core";
import GroupCategories from "../GroupCategories/GroupCategories";
import GroupStreams from "../GroupStreams/GroupStreams";


const DesktopFeed = ({groupData, hasCategories, userData, alreadyJoined, handleToggleActive, mobile, user, livestreams, searching, livestreamId, careerCenterId, listenToUpcoming, selectedOptions}) => {
    return (
        <Grid container spacing={1} style={{minHeight: "50vh", margin: 10}}>
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
    );
};

export default DesktopFeed;
