import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Button, Card, CardHeader, Grid, Menu, MenuItem} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

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
    }
}));

const Title = ({setGlobalTimeFrame, globalTimeFrames, globalTimeFrame}) => {

    const classes = useStyles()
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setGlobalTimeFrame(globalTimeFrames[index])
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
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
                subheader={`Over the past ${globalTimeFrame.name}`}
                action={
                    <div>
                        <Button onClick={handleClickListItem}
                                endIcon={<ArrowDropDownIcon/>}
                                variant="text">
                            {`In the last ${globalTimeFrame.name}`}
                        </Button>
                        <Menu
                            id="lock-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {globalTimeFrames.map((option, index) => (
                                <MenuItem
                                    key={option.id}
                                    selected={option.id === globalTimeFrame.id}
                                    onClick={(event) => handleMenuItemClick(event, index)}
                                >
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Menu>
                    </div>
                }

            />
        </Card>
    );
};

export default Title;
