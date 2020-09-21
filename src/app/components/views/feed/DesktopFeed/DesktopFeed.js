import React from 'react';
import {Box} from "@material-ui/core";
import GroupCategories from "../GroupCategories/GroupCategories";
import GroupStreams from "../GroupStreams/GroupStreams";


const DesktopFeed = ({groupData, userData, alreadyJoined, handleToggleActive, mobile}) => {
    return (
        <Box style={{border: "2px solid orange", flex: 1}} display="flex" flexDirection="row">
          <GroupCategories mobile={mobile} handleToggleActive={handleToggleActive} userData={userData} alreadyJoined={alreadyJoined} groupData={groupData}/>
          <GroupStreams groupData={groupData}/>
        </Box>
    );
};

export default DesktopFeed;
