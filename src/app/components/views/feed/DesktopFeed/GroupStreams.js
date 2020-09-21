import React from 'react';
import {Typography} from "@material-ui/core";

const GroupStreams = ({groupId}) => {
    return (
        <div style={{flex: 1, border: "1px solid blue", height: "80vh"}}>
            {groupId}
        </div>
    );
};

export default GroupStreams;
