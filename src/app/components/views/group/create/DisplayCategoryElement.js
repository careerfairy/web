import React from "react";
import Paper from "@material-ui/core/Paper";
import {withFirebase} from "data/firebase";
import {makeStyles} from "@material-ui/core/styles";
import {Box, Chip} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    whiteBox: {
        backgroundColor: "white",
        borderRadius: "5px",
        padding: "20px",
        margin: "10px 0",
        textAlign: "left",
        display: "flex",
    },
    label: {
        fontSize: "0.8em",
        fontWeight: "700",
        color: "rgb(160,160,160)",
        margin: "0 0 5px 0",
    },
    title: {
        fontSize: "1.2em",
        fontWeight: "700",
        color: "rgb(80,80,80)",
    },
    chip: {
        margin: theme.spacing(0.5),
    },
}));

const DisplayCategoryElement = ({category}) => {
    const classes = useStyles();

    const optionElements = category.options.map((option, index) => {
        return (
            <Chip
                key={option.id || index}
                label={option.name}
                className={classes.chip}
                variant="outlined"
            />
        );
    });

    return (
        <Paper className={classes.whiteBox}>
            <Box flex="0.3">
                <div className={classes.label}>Category Name</div>
                <div className="white-box-title">{category.name}</div>
            </Box>
            <Box flex="0.7">
                <div className={classes.label}>Category Options</div>
                {optionElements}
            </Box>
        </Paper>
    );
};

export default withFirebase(DisplayCategoryElement);
