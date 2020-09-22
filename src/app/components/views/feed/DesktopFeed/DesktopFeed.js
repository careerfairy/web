import React from 'react';
import {Box, Container} from "@material-ui/core";
import GroupCategories from "../GroupCategories/GroupCategories";
import GroupStreams from "../GroupStreams/GroupStreams";


const DesktopFeed = ({groupData, userData, alreadyJoined, handleToggleActive, mobile, user, livestreams, searching}) => {
    return (
        <Container style={{flex: 1, display: "flex", minHeight: mobile ? "none" : 700}}>
            {groupData.categories && livestreams.length ?
                <GroupCategories livestreams={livestreams}
                                 mobile={mobile}
                                 handleToggleActive={handleToggleActive}
                                 userData={userData}
                                 alreadyJoined={alreadyJoined}
                                 groupData={groupData}/> : null}
            <GroupStreams
                user={user}
                searching={searching}
                livestreams={livestreams}
                userData={userData}
                groupData={groupData}
            />
        </Container>
    );
};

export default DesktopFeed;
