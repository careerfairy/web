import React from 'react';
import {Box} from "@material-ui/core";
import GroupStreams from "./GroupStreams";
import GroupCategories from "./GroupCategories";


const DesktopFeed = ({groupData, userData, alreadyJoined}) => {
    return (
        <Box style={{border: "2px solid orange"}} display="flex" flexDirection="row">
            <GroupCategories  userData={userData} alreadyJoined={alreadyJoined} group={groupData}/>
            <GroupStreams groupId={groupData.groupId}/>
        </Box>
    );
};

export default DesktopFeed;
