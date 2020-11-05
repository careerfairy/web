import {Box} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import React from "react";

const useStyles = makeStyles(theme => ({
    categoryContainerCenteredStyle: {
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
    },
    categoryContainerTopAlignedStyles: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
    questionContainerHeaderStyle: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-evenly",
        boxShadow: "0 4px 2px -2px rgb(200,200,200)",
        zIndex: 9000,
        backgroundColor: "white",
        padding: theme.spacing(2),
        height: 130,

    },
    questionContainerTitleStyle: {
        width: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontSize: "1.2em",
        fontWeight: 500,
        textAlign: "center",
    }
}))

export const CategoryContainerCentered = ({...props}) => {
    const classes = useStyles()
    return <Box className={classes.categoryContainerCenteredStyle} {...props}/>
}

export const CategoryContainerTopAligned = ({...props}) => {
    const classes = useStyles()
    return <Box className={classes.categoryContainerTopAlignedStyles} {...props}/>
}

export const QuestionContainerHeader = ({...props}) => {
    const classes = useStyles()
    return <Box className={classes.questionContainerHeaderStyle} {...props}/>
}

export const QuestionContainerTitle = ({...props}) => {
    const classes = useStyles()
    return <Box className={classes.questionContainerTitleStyle} {...props}/>
}



