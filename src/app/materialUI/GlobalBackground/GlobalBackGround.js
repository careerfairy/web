import React from 'react';
import {Box, withStyles} from "@material-ui/core";

export const GlobalBackground = withStyles({
    root: {
        backgroundColor: "rgb(250,250,250)",
        height: "100%",
        minHeight: "100vh",
    },
})(Box);

export const GreyBackground = withStyles({
    root: {
        display: "flex",
        flexDirection: "column" ,
        backgroundColor: "rgb(230,230,230)",
        height: "100%",
        minHeight: "100vh",
    },
})(Box);

export const DarkBackground = withStyles({
    root: {
        backgroundColor: "rgb(44, 66, 81)",
        minHeight: "100%",
    },
})(Box);

export const MobileBackground = withStyles({
    root: {
        backgroundColor: "rgb(250,250,250)",
        height: "100%"
    },
})(Box);

export const TealBackground = withStyles({
    root: {
        backgroundColor: "rgb(0, 210, 170)",
        height: "100%",
        minHeight: "100vh",
        padding: "0 0 40px 0",
        display: "flex",
        flexDirection: "column"
    },
})(Box);



