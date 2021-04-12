import React, {useState} from 'react';
import {Box, Button, Card, CardContent, Collapse, Divider, Grid, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import CategoryCard from "./CategoryCard";
import {MultilineText} from "../../../helperFunctions/HelperFunctions";
import clsx from "clsx";
import FilterIcon from '@material-ui/icons/Tune';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(3)
    },
    card: {
        overflowY: "auto",
        '&::-webkit-scrollbar': {
            width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
        },
        maxHeight: "calc(100vh - 70px)",

    },
    mobile: {
        position: "static",
        top: "auto",
        maxHeight: "auto"
    },
    actions: {
        display: "flex",
        flexFlow: "column",
        '& > * + *': {
            marginTop: theme.spacing(3),
        },
    },
    media: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "white",
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: "250px",
    },
    image: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        maxWidth: "90%",
        maxHeight: "90%",
        borderRadius: theme.spacing(1)
    },
    groupDescription: {
        padding: `0 ${theme.spacing(3)}px`,
    },
}));

const GroupCategories = ({groupData, alreadyJoined, handleToggleActive, mobile, hasCategories}) => {

    const classes = useStyles({mobile});

    const [filterOpen, setFilterOpen] = useState(false);
    const handleToggleFilter = () => setFilterOpen(!filterOpen)

    return (
        <Grid item xs={12} className={classes.root}>
            <Button
                size="large"
                variant={filterOpen ? "contained": "text"}
                color={filterOpen ? "primary" : "default"}
                onClick={handleToggleFilter}
                startIcon={<FilterIcon/>}
            >
                Filters
            </Button>
            <Collapse in={filterOpen}>
                <div
                    className={clsx(classes.card, {
                        [classes.mobile]: mobile
                    })}
                >
                    {groupData.extraInfo &&
                    <Typography component="div" variant="body1" className={classes.groupDescription}>
                        <MultilineText text={groupData.extraInfo}/>
                    </Typography>}
                    {!!hasCategories && <CardContent>
                        <Box className={classes.actions}>
                            {groupData.categories.map(category => (
                                    <CategoryCard
                                        mobile={mobile}
                                        key={category.id}
                                        category={category}
                                        groupData={groupData}
                                        handleToggleActive={handleToggleActive}
                                    />
                                )
                            )}
                        </Box>
                    </CardContent>}
                </div>
            </Collapse>
            <Divider/>
        </Grid>
    )
};

export default GroupCategories;
