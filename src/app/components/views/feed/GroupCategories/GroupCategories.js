import React, {useEffect, useState} from 'react';
import {Box, Card, CardContent, CardMedia, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import CategoryCard from "./CategoryCard";
import {SizeMe} from "react-sizeme";
import StackGrid from "react-stack-grid";


const useStyles = makeStyles((theme) => ({
    root: {
        paddingBottom: 0
    },
    actions: {
        display: "flex",
        flexFlow: "column",
    },
    media: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "white",
        padding: "1.5em 1em 1em 1em",
        height: "120px",
    },
    image: {
        objectFit: "contain",
        maxWidth: "80%",
    },
}));

const GroupCategories = ({groupData, alreadyJoined, handleToggleActive, mobile, livestreams}) => {
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
        <div style={{width: mobile ? "100%" : "40%", paddingTop: 18}} className={classes.root}>
            {groupData.categories?.length &&
            <Card style={{position: mobile ? "static" : "sticky", top: mobile ? "auto" : 160}}>
                {!alreadyJoined &&
                <Typography variant="h5" align="center">Start Following {groupData.universityName}:</Typography>}
                {!mobile && <CardMedia className={classes.media}>
                    <img src={groupData.logoUrl} className={classes.image} alt=""/>
                </CardMedia>}
                <CardContent>
                    <Typography variant="h4" hidden={mobile || !groupData.categories}>Filter events by:</Typography>
                    <Box className={classes.actions}>
                        <SizeMe>{({size}) => (
                            <StackGrid
                                style={{marginTop: 10}}
                                duration={0}
                                columnWidth={"100%"}
                                gutterWidth={20}
                                gutterHeight={20}
                                gridRef={grid => setGrid(grid)}>
                                {groupData.categories.map(category => {
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
            </Card>}
        </div>
    )
};

export default GroupCategories;
