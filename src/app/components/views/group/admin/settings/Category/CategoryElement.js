import React, {Fragment, useState, useEffect} from 'react';
import {Grid, Icon} from "semantic-ui-react";
import EditIcon from '@material-ui/icons/Edit';
import {withFirebase} from 'context/firebase';
import CategoryEdit from './CategoryEdit';
import {Box, Chip, IconButton, Zoom} from "@material-ui/core";
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
        flexWrap: "wrap",
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

    const dynamicSort = (property) => {
        let sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            /* next line works with strings and numbers,
             * and you may want to customize it to your needs
             */
            const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    let sortedOptions = []

    sortedOptions = [...category.options]?.sort(dynamicSort("name"))

    const optionElements = sortedOptions.map((option, index) => {
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
            <Zoom in={category.id}>
                <Paper className={classes.whiteBox}>
                    <Box style={{minWidth: "120px"}}>
                        <div className={classes.label}>Category Name</div>
                        <div className="white-box-title">{category.name}</div>
                    </Box>
                    <Box style={{minWidth: "240px"}}>
                        <div className={classes.label}>Category Options</div>
                        {optionElements}
                    </Box>
                    <IconButton className={classes.icon}
                                onClick={() => setEditMode(true)}>
                        <EditIcon color="primary"/>
                    </IconButton>
                </Paper>
            </Zoom>
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