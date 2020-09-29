import React, {useEffect, useState} from 'react';
import {Box, Card, CardContent, CardMedia, Grow} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import CategoryCard from "./CategoryCard";
import {SizeMe} from "react-sizeme";
import StackGrid from "react-stack-grid";


const useStyles = makeStyles((theme) => ({
    root: {
        paddingBottom: 0,
        paddingTop: 14,
        width: ({mobile}) => mobile ? "100%" : "40%",
    },
    card: {
        // padding: "1em",
        overflow: "auto",
        position: ({mobile}) => mobile ? "static" : "sticky",
        top: ({mobile}) => mobile ? "auto" : 165,
        maxHeight: ({mobile}) => mobile? "auto": "calc(100vh - 180px)"
    },
    actions: {
        display: "flex",
        flexFlow: "column",
    }, 
    media: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "white",
        marginBottom: "2em"
    },
    imageContainer: {
        position: "relative",
        height: "160px",
        width: "160px",
        border: "6px solid #00d2aa",
        borderRadius: "50%",
        boxShadow: "0 0 4px rgb(100,100,100)",
        background: "rgb(250,250,250)"
    },
    image: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        objectFit: "contain",
        maxWidth: "55%",
    },
}));

const GroupCategories = ({groupData, alreadyJoined, handleToggleActive, mobile}) => {

    const classes = useStyles({mobile});
    const [grid, setGrid] = useState(null);


    useEffect(() => {
        if (grid) {
            setTimeout(() => {
                grid.updateLayout();
            }, 10);
        }
    }, [grid, groupData]);

    return (
        <div className={classes.root}>
            {groupData.categories?.length &&
            <Grow in={Boolean(groupData.categories?.length)}>
                <Card className={classes.card}>
                    <CardContent>
                        <CardMedia className={classes.media}>
                            <div className={classes.imageContainer }>
                                <img src={groupData.logoUrl} className={classes.image}
                                    alt={`${groupData.universityName} logo`}/>
                            </div>
                        </CardMedia>
                        <Box className={classes.actions}>
                            <SizeMe>{({size}) => (
                                <StackGrid
                                    style={{marginTop: 10}}
                                    duration={20}
                                    columnWidth={"100%"}
                                    gridRef={grid => setGrid(grid)}>
                                    {groupData.categories.map(category => {
                                        if (category.name.toLowerCase() !== "level of study") {
                                            return (
                                                <CategoryCard width={size.width} mobile={mobile} key={category.id}
                                                    category={category}
                                                    handleToggleActive={handleToggleActive}/>
                                            )
                                        }
                                    })}
                                </StackGrid>
                            )}</SizeMe>
                        </Box>
                    </CardContent>
                </Card>
            </Grow>
            }
        </div>
    )
};

export default GroupCategories;
