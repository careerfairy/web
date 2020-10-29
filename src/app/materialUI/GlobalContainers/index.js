import {Box, withStyles} from "@material-ui/core";

export const CategoryContainerCentered = withStyles(theme => ({
    root: {
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
    },
}))(Box);

export const CategoryContainerTopAligned = withStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
}))(Box);

export const QuestionContainerHeader = withStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-around",
        boxShadow: "0 4px 2px -2px rgb(200,200,200)",
        zIndex: 9000,
        backgroundColor: "white",
        "& > *": {
            marginTop: theme.spacing(2),

        },
        "& > * :not(:first-child)": {
            marginBottom: theme.spacing(2)
        },
    }
}))(Box);

export const QuestionContainerTitle = withStyles(theme => ({
    root: {
        width: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontSize: "1.2em",
        fontWeight: 500,
        textAlign: "center",
    }
}))(Box);


