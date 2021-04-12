import React, {useEffect} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Box, Drawer, Typography} from "@material-ui/core";
import CategoryCard from "../GroupCategories/CategoryCard";
import {useDispatch, useSelector} from "react-redux";
import * as actions from '../../../../store/actions'

const useStyles = makeStyles(theme => ({
    actions: {
        display: "flex",
        flexFlow: "column",
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    paperRoot:{
        borderRadius: theme.spacing(2,2,0,0)
    }
}));

const FiltersDrawer = ({groupData, handleToggleActive, hasCategories}) => {


    const classes = useStyles()
    const filterOpen = useSelector(state => state.nextLivestreams.filterOpen && hasCategories)
    const dispatch = useDispatch()
    useEffect(() => {
        if (!hasCategories) {
            handleCloseFilter()
        }
    }, [hasCategories])

    const handleCloseFilter = () => dispatch(actions.closeNextLivestreamsFilter())

    return (
        <Drawer
            onClose={handleCloseFilter}
            anchor="bottom"
            open={filterOpen}
            PaperProps={{
                className: classes.paperRoot
            }}
        >
            <Box p={2} className={classes.actions}>
                <Typography color="textSecondary" variant="h5">
                    Filters
                </Typography>
                {groupData.categories?.map(category => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        handleToggleActive={handleToggleActive}
                    />
                ))}
            </Box>
        </Drawer>
    );
};

export default FiltersDrawer;
