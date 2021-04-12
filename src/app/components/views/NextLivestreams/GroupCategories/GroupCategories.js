import React, {useState} from 'react';
import {Box, Button, Collapse, Divider, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import CategoryCard from "./CategoryCard";
import FilterIcon from '@material-ui/icons/Tune';

const useStyles = makeStyles((theme) => ({
    actions: {
        display: "flex",
        flexFlow: "column",
        '& > * + *': {
            marginTop: theme.spacing(3),
        },
    },
}));

const GroupCategories = ({groupData, handleToggleActive, hasCategories}) => {

    const classes = useStyles();

    const [filterOpen, setFilterOpen] = useState(false);
    const handleToggleFilter = () => setFilterOpen(!filterOpen)

    return hasCategories ? (
        <Grid item xs={12}>
            <Button
                size="large"
                color={filterOpen ? "primary" : "default"}
                onClick={handleToggleFilter}
                startIcon={<FilterIcon/>}
            >
                Filters
            </Button>
            <Collapse in={filterOpen}>
                <Box className={classes.actions}>
                    {groupData.categories.map(category => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            handleToggleActive={handleToggleActive}
                        />
                    ))}
                </Box>
            </Collapse>
            <Divider/>
        </Grid>
    ): null
};

export default GroupCategories;
