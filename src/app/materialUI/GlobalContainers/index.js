import {Box, Container, useMediaQuery} from "@material-ui/core";
import {makeStyles, useTheme} from '@material-ui/core/styles';
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
        boxShadow: theme.shadows[5],
        zIndex: 9000,
        backgroundColor: theme.palette.background.paper,
        // padding: theme.spacing(2),
        // height: 130,

    },
    questionContainerTitleStyle: {
        width: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontSize: "1.2em",
        fontWeight: 500,
        textAlign: "center",
        margin: theme.spacing(2, 0)
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

export const ResponsiveContainer = ({children, ...props}) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.up('sm'));
    return <Container maxWidth="lg" {...props}>
        {children}
    </Container>
}


