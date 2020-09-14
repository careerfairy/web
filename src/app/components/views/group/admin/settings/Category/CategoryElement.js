import React, {Fragment, useState, useEffect} from 'react';
import {Grid, Icon} from "semantic-ui-react";
import EditIcon from '@material-ui/icons/Edit';
import {withFirebase} from 'data/firebase';
import CategoryEdit from './CategoryEdit';
import {Box, Chip, IconButton, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
    whiteBox: {
        backgroundColor: "white",
        borderRadius: "5px",
        padding: "20px",
        margin: "10px 0",
        textAlign: "left",
        display: "flex",
        position: "relative",
    },
    icon: {
        position: "absolute",
        top: 10,
        right: 10
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

function CategoryElement({handleUpdateCategory, category, firebase, handleAddTempCategory, handleDeleteLocalCategory, group, isLocal}) {
    const classes = useStyles()
    const [editMode, setEditMode] = useState(false)


    const optionElements = category.options?.map((option, index) => {
        return (
            <Chip
                key={option.id || index}
                label={option.name}
                variant="outlined"
            />
        );
    });

    if (editMode === false) {
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
                <IconButton className={classes.icon}
                            onClick={() => setEditMode(true)}>
                    <EditIcon color="primary"/>
                </IconButton>
            </Paper>
        );
    }

    return (
        <Fragment>
            <CategoryEdit group={group}
                          isLocal={isLocal}
                          handleUpdateCategory={handleUpdateCategory}
                          handleAddTempCategory={handleAddTempCategory}
                          handleDeleteLocalCategory={handleDeleteLocalCategory}
                          category={category}
                          setEditMode={setEditMode}/>
        </Fragment>
    );
}

export default withFirebase(CategoryElement);