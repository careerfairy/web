import React, {useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Button, Card, CardHeader, Grid, Menu, MenuItem} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles(theme => ({
    root: {
        boxShadow: "none",
        background: "none"
    },
    title: {
        // fontWeight: 400
    },
    header: {
        paddingLeft: theme.spacing(3)
    },
    titleButton: {
        paddingRight: theme.spacing(1)
    }
}));

const Title = ({
                   setGlobalTimeFrame,
                   globalTimeFrames,
                   group,
                   currentUserDataSet,
                   userDataSets,
                   setCurrentUserDataSet,
                   globalTimeFrame
               }) => {

    const classes = useStyles()
    const [dateAnchorEl, setDateAnchorEl] = useState(null);
    const [studentAnchorEl, setStudentAnchorEl] = useState(null);

    const handleDateClickListItem = (event) => {
        setDateAnchorEl(event.currentTarget);
    };

    const handleDateMenuItemClick = (event, index) => {
        setGlobalTimeFrame(globalTimeFrames[index])
        setDateAnchorEl(null);
    };

    const handleDateMenuClose = () => {
        setDateAnchorEl(null);
    };
    const handleStudentClickListItem = (event) => {
        setStudentAnchorEl(event.currentTarget);
    };

    const handleStudentMenuItemClick = (event, index) => {
        setCurrentUserDataSet(userDataSets[index])
        setStudentAnchorEl(null);
    };

    const handleStudentMenuClose = () => {
        setStudentAnchorEl(null);
    };

    return (
        <Card className={classes.root}>
            <CardHeader
                className={classes.header}
                titleTypographyProps={{
                    className: classes.title,
                    variant: "h4"
                }}
                title={`Channel Analytics`}
                subheader={`Over the past ${globalTimeFrame.name} for ${currentUserDataSet.displayName}`}
                action={
                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                        <Button onClick={handleDateClickListItem}
                                className={classes.titleButton}
                                endIcon={<ArrowDropDownIcon/>}
                                variant="text">
                            {`In the last ${globalTimeFrame.name}`}
                        </Button>
                        <Menu
                            id="followers-menu"
                            anchorEl={dateAnchorEl}
                            keepMounted
                            open={Boolean(dateAnchorEl)}
                            onClose={handleDateMenuClose}
                        >
                            {globalTimeFrames.map((option, index) => (
                                <MenuItem
                                    key={option.id}
                                    selected={option.id === globalTimeFrame.id}
                                    onClick={(event) => handleDateMenuItemClick(event, index)}
                                >
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Menu>
                        {group.universityCode &&
                        <>
                            <Button onClick={handleStudentClickListItem}
                                    className={classes.titleButton}
                                    endIcon={<ArrowDropDownIcon/>}
                                    variant="outlined">
                                {`For ${currentUserDataSet.displayName}`}
                            </Button>
                            <Menu
                                id="students-Menu"
                                anchorEl={studentAnchorEl}
                                keepMounted
                                open={Boolean(studentAnchorEl)}
                                onClose={handleStudentMenuClose}
                            >
                                {userDataSets.map((option, index) => (
                                    <MenuItem
                                        key={option.id}
                                        selected={option.id === currentUserDataSet.id}
                                        onClick={(event) => handleStudentMenuItemClick(event, index)}
                                    >
                                        {option.displayName}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </>}
                    </Box>
                }

            />
        </Card>
    );
};

export default Title;
