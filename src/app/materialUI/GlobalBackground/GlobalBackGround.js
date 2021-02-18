import React from 'react';
import {Box} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles(theme => ({
    globalBackgroundStyles: {
        height: "100%",
        minHeight: "100vh",
        backgroundColor: theme.palette.type === "dark" ? theme.palette.background.default :"rgb(250,250,250)",

    },
    greyBackgroundStyles: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.type === "dark" ? theme.palette.background.default : "rgb(230,230,230)",
        height: "100%",
        minHeight: "100vh",
    },
    darkBackgroundStyles: {
        backgroundColor: "rgb(44, 66, 81)",
        minHeight: "100%",
    },
    mobileBackgroundStyles: {
        backgroundColor: "rgb(250,250,250)",
        height: "100%"
    },
    tealBackgroundStyles: {
        backgroundColor: "rgb(0, 210, 170)",
        height: "100%",
        minHeight: "100vh",
        padding: "0 0 40px 0",
        display: "flex",
        flexDirection: "column"
    },
    themedBackgroundStyles: {
        backgroundColor: theme.palette.primary.main,
        height: "100%",
        minHeight: "100vh",
        padding: "0 0 40px 0"
    },
    darkThemedBackgroundStyles: {
        backgroundColor: theme.palette.primary.dark,
        height: "100%",
        minHeight: "100vh",
        padding: "0 0 40px 0",
        display: "flex",
        flexDirection: "column"
    }
}))

export const GlobalBackground = ({...props}) => {
    const classes = useStyles()
    return <Box className={classes.globalBackgroundStyles} {...props}/>
}

export const GreyBackground = ({...props}) => {
    const classes = useStyles()
    return <Box className={classes.greyBackgroundStyles} {...props}/>
}

export const DarkBackground = ({...props}) => {
    const classes = useStyles()
    return <Box className={classes.darkBackgroundStyles} {...props}/>
}

export const MobileBackground = ({...props}) => {
    const classes = useStyles()
    return <Box className={classes.mobileBackgroundStyles} {...props}/>
}

export const TealBackground = ({...props}) => {
    const classes = useStyles()
    return <Box className={classes.tealBackgroundStyles} {...props}/>
}
export const DarkThemedBackground = ({...props}) => {
    const classes = useStyles()
    return <Box className={classes.darkThemedBackgroundStyles} {...props}/>
}




