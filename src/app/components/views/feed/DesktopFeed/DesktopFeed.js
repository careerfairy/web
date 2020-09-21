import React from 'react';
import {Box} from "@material-ui/core";
import GroupCategories from "../GroupCategories/GroupCategories";
import GroupStreams from "../GroupStreams/GroupStreams";


const DesktopFeed = ({groupData, userData, alreadyJoined, handleToggleActive, mobile, user}) => {
    return (
        <Box style={{flex: 1, margin: "20px 0"}} display="flex" flexDirection="row">
            {groupData.categories && <GroupCategories mobile={mobile} handleToggleActive={handleToggleActive} userData={userData}
                              alreadyJoined={alreadyJoined} groupData={groupData}/>}
            <GroupStreams
                user={user}
                userData={userData}
                groupData={groupData}
            />
        </Box>
    );
};

export default DesktopFeed;
