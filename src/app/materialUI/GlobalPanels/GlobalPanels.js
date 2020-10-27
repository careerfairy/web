import React from 'react';
import Box from "@material-ui/core/Box";

export const TabPanel = ({children, value, index, ...other}) => {

    return (
        <div
            role="tabpanel"
            id={`full-width-tabpanel-${index}`}
            style={{height: "100%"}}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {(
                <Box style={{height: "100%"}}>
                    {children}
                </Box>
            )}
        </div>
    );
}
