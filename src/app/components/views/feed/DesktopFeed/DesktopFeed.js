import React from 'react';
import {Box, Container} from "@material-ui/core";
import GroupCategories from "../GroupCategories/GroupCategories";
import GroupStreams from "../GroupStreams/GroupStreams";


const DesktopFeed = ({groupData, userData, alreadyJoined, handleToggleActive, mobile, user, livestreams, searching, livestreamId, careerCenterId,listenToUpcoming}) => {
    return (
        <Container style={{flex: 1, display: "flex", minHeight: 700}}>
            {groupData.categories ?
                <GroupCategories livestreams={livestreams}
                                 mobile={mobile}
                                 user={user}
                                 handleToggleActive={handleToggleActive}
                                 userData={userData}
                                 alreadyJoined={alreadyJoined}
                                 groupData={groupData}/> : null}
            <GroupStreams
                user={user}
                livestreamId={livestreamId}
                alreadyJoined={alreadyJoined}
                searching={searching}
                mobile={mobile}
                listenToUpcoming={listenToUpcoming}
                careerCenterId={careerCenterId}
                livestreams={livestreams}
                userData={userData}
                groupData={groupData}
            />
        </Container>
    );
};

export default DesktopFeed;
