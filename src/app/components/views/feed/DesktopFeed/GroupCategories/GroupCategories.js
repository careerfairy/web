import React, {Fragment, useEffect, useState} from 'react';
import UserCategorySelector from "../../../profile/UserCategorySelector";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import {Box, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Typography} from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
        width: "30%",
        height: "80vh"
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
        alignItems: "center",
    },
}));

const GroupCategories = ({group, firebase, userData, alreadyJoined}) => {
    
    const classes = useStyles();
    const [categories, setCategories] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (group.categories) {
            const groupCategories = group.categories.map((obj) => ({
                ...obj,
                selectedValueId: "",
            }));
            if (alreadyJoined) {
                const userCategories = userData.registeredGroups.find(
                    (el) => el.groupId === group.id
                ).categories;
                userCategories.forEach((category, index) => {
                    groupCategories.forEach((groupCategory) => {
                        const exists = groupCategory.options.some(
                            (option) => option.id === category.selectedValueId
                        );
                        if (exists) {
                            groupCategory.selectedValueId = category.selectedValueId;
                        }
                    });
                });
            }
            setCategories(groupCategories);
        } else {
            setCategories([])
        }
    }, [group]);

    useEffect(() => {
        if (categories) {
            const notAllSelected = !categories.some(
                (category) => category.selectedValueId === ""
            );
            setAllSelected(notAllSelected);
        }
    }, [categories]);

    const handleSetSelected = (categoryId, event) => {
        const newCategories = [...categories];
        const index = newCategories.findIndex((el) => el.id === categoryId);
        newCategories[index].selectedValueId = event.target.value;
        setCategories(newCategories);
    };

    const handleJoinGroup = async () => {
        try {
            setSubmitting(true);
            const newCategories = categories.map((categoryObj) => {
                return {
                    id: categoryObj.id,
                    selectedValueId: categoryObj.selectedValueId,
                };
            });
            const groupObj = {
                groupId: group.id,
                categories: newCategories,
            };
            let arrayOfGroupObjects = [];
            let arrayOfGroupIds = [];
            if (userData.groupIds && userData.registeredGroups) {
                if (alreadyJoined) {
                    console.log(alreadyJoined);
                    arrayOfGroupIds = [...userData.groupIds];
                    const index = userData.registeredGroups.findIndex(
                        (group) => group.groupId === groupObj.groupId
                    );
                    arrayOfGroupObjects = [...userData.registeredGroups];
                    arrayOfGroupObjects[index] = groupObj;
                } else {
                    arrayOfGroupObjects = [...userData.registeredGroups, groupObj];
                    arrayOfGroupIds = arrayOfGroupObjects.map((obj) => obj.groupId);
                }
            } else {
                arrayOfGroupObjects.push(groupObj);
                arrayOfGroupIds.push(groupObj.groupId);
            }
            const userId = userData.id || userData.userEmail
            await firebase.setgroups(
                userId,
                arrayOfGroupIds,
                arrayOfGroupObjects
            );
            setSubmitting(false);
        } catch (e) {
            console.log("error in handle join", e);
            setSubmitting(false);
        }
    };

    const renderCategories = categories.map((category, index) => {
        return (
            <Fragment key={category.id}>
                <UserCategorySelector
                    handleSetSelected={handleSetSelected}
                    index={index}
                    category={category}
                />
            </Fragment>
        );
    });


    return (
        <Card className={classes.root}>
            {!alreadyJoined &&<Typography variant="h5" align="center">Follow live streams from:</Typography>}
            <Typography variant="h6" align="center"><strong>{group.universityName}</strong></Typography>
            <CardMedia className={classes.media}>
                <img src={group.logoUrl} className={classes.image} alt=""/>
            </CardMedia>
            <CardContent>
                <Typography align="center" noWrap>
                    {group.description}
                </Typography>
                <Box className={classes.actions}>
                    {categories.length > 1 ? renderCategories : null}
                </Box>
                <Box mt={2} display="flex" justifyContent="center">
                    <Button
                        disabled={!allSelected || submitting}
                        variant="contained"
                        size="large"
                        endIcon={submitting && <CircularProgress size={20} color="inherit"/>}
                        onClick={handleJoinGroup}
                        color="primary"
                        autoFocus>
                        {alreadyJoined ? "Update" : "Follow"}
                    </Button>
                    <Button style={{marginLeft: 5}} size="large">
                        Unfollow
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
};

export default GroupCategories;
