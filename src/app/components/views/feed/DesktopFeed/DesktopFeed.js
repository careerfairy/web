import React from 'react';
import {Box} from "@material-ui/core";
import GroupStreams from "./GroupStreams";
import GroupCategories from "./GroupCategories/GroupCategories";


const DesktopFeed = ({groupData, userData, alreadyJoined, handleToggleActive, mobile}) => {
    return (
        <Box style={{border: "2px solid orange"}} display="flex" flexDirection="row">
          <GroupCategories mobile={mobile} handleToggleActive={handleToggleActive} userData={userData} alreadyJoined={alreadyJoined} groupData={groupData}/>
          <GroupStreams groupId={groupData.groupId}/>
        </Box>
    );
};

export default DesktopFeed;
