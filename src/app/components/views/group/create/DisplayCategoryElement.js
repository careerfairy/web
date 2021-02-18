import React from "react";
import {withFirebase} from "context/firebase";
import {makeStyles} from "@material-ui/core/styles";
import { Box, Chip, Paper } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    whiteBox: {
        backgroundColor: "white",
        borderRadius: "5px",
        padding: "20px",
        margin: "10px 0",
        textAlign: "left",
        display: "flex",
        flexWrap: "wrap",
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
            <Box style={{minWidth: "120px"}}>
                <div className={classes.label}>Category Name</div>
                <div>{category.name}</div>
            </Box>
            <Box style={{minWidth: "240px"}}>
                <div className={classes.label}>Category Options</div>
                {optionElements}
            </Box>
        </Paper>
    );
};

export default withFirebase(DisplayCategoryElement);
