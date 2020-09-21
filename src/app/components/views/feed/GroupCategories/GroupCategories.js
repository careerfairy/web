import React from 'react';
import {Box, Card, CardContent, CardMedia, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import CategoryCard from "./CategoryCard";


const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
        paddingBottom: 0
    },
    media: {
        display: "flex",
        justifyContent: "center",
        padding: "1.5em 1em 1em 1em",
        height: "120px",
    },
    image: {
        objectFit: "contain",
        maxWidth: "80%",
    },
    actions: {
        display: "flex",
        flexFlow: "column",
        overflow: "auto"
    },
}));

const GroupCategories = ({groupData, alreadyJoined,handleToggleActive, mobile}) => {

    const classes = useStyles();

    const renderCategoryCards = groupData.categories?.map(category => {
        return(
            <CategoryCard mobile={mobile} key={category.id} category={category} handleToggleActive={handleToggleActive}/>
        )
    })

    return (
        <Card style={{width: mobile ? "100%": "40%"}} className={classes.root}>
            {!alreadyJoined && <Typography variant="h5" align="center">Follow live streams from:</Typography>}
            <Typography variant="h6" align="center"><strong>{groupData?.universityName}</strong></Typography>
            <CardMedia className={classes.media}>
                <img src={groupData?.logoUrl} className={classes.image} alt=""/>
            </CardMedia>
            <CardContent>
                <Typography align="center" noWrap>
                    {groupData?.description}
                </Typography>
                <Box className={classes.actions}>
                    {renderCategoryCards}
                </Box>
            </CardContent>
        </Card>
    )
};

export default GroupCategories;
