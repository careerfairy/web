import React from 'react';
import Box from "@material-ui/core/Box";

export const TabPanel = ({hidden, children, height, value, index, ...other}) => {

    return (
        <Box hidden={hidden} {...other} style={{height: height || "100%", ...other.style}}>
            {children}
        </Box>
    );
}

export const SimplePanel = ({panelId, children, height,...other}) => {

    return (
        <div {...other} id={panelId} style={{height: "100%", ...other.style}}>
            {children}
        </div>
    );
}
