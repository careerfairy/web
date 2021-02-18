import React from 'react';
import * as PropTypes from "prop-types";
import { Box } from '@material-ui/core';

export const TabPanel = ({hidden, children, height, value, index,className, ...other}) => {

    return (
        <Box hidden={hidden} className={className} {...other} style={{height: height || "100%", ...other.style}}>
            {children}
        </Box>
    );
}

export const SimplePanel = ({panelId, children, height, ...other}) => {

    return (
        <div {...other} id={panelId} style={{height: "100%", ...other.style}}>
            {children}
        </div>
    );
}

export const SwipeablePanel = (props) => {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <>
                    {children}
                </>
            )}
        </div>
    );
}

SwipeablePanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};