import React, {useEffect, useState} from 'react';
import {Box, Card, CardContent, CardMedia, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import CategoryCard from "./CategoryCard";
import {SizeMe} from "react-sizeme";
import StackGrid from "react-stack-grid";


const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
        paddingBottom: 0
    },
    actions: {
        display: "flex",
        flexFlow: "column",
    },
}));

const GroupCategories = ({groupData, alreadyJoined, handleToggleActive, mobile}) => {

    const classes = useStyles();
    const [grid, setGrid] = useState(null);


    useEffect(() => {
        if (grid) {
            setTimeout(() => {
                grid.updateLayout();
            }, 10);
        }
    }, [grid, groupData]);

    return (
        <div style={{width: mobile ? "100%" : "40%"}} className={classes.root}>
            {!alreadyJoined &&
            <Typography variant="h5" align="center">Start Following {groupData.universityName}:</Typography>}
            <CardContent>
                <Typography variant="h4" hidden={mobile || !groupData.categories}>Filter events by:</Typography>
                <Box className={classes.actions}>
                    <SizeMe>{({size}) => (
                        <StackGrid
                            style={{marginTop: 20}}
                            duration={0}
                            columnWidth={"100%"}
                            gutterWidth={20}
                            gutterHeight={20}
                            gridRef={grid => setGrid(grid)}>
                            {groupData.categories?.map(category => {
                                return (
                                    <CategoryCard width={size.width} mobile={mobile} key={category.id}
                                                  category={category}
                                                  handleToggleActive={handleToggleActive}/>
                                )
                            })}
                        </StackGrid>
                    )}</SizeMe>
                </Box>
            </CardContent>
        </div>
    )
};

export default GroupCategories;
