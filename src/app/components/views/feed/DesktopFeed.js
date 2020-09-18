import React from 'react';
import {Box, Container} from "@material-ui/core";

const DesktopFeed = () => {


    return (
        <Box display="flex" flexDirection="row">
            <div style={{backgroundColor: "pink", flex: 0.3, border: "1px solid pink", height: "80vh"}}/>
            <div style={{backgroundColor: "blue", flex: 0.7, border: "1px solid blue", height: "80vh"}}/>
        </Box>
    );
};

export default DesktopFeed;
