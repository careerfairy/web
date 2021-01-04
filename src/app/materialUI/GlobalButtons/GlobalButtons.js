import IconButton from "@material-ui/core/IconButton";
import ChevronRightRoundedIcon from "@material-ui/icons/ChevronRightRounded";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {fade} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

const useStyles = makeStyles(theme => ({
    sendIcon: {
        background: "white",
        color: ({isEmpty}) => isEmpty ? "grey" : theme.palette.primary.main,
        borderRadius: "50%",
        fontSize: 15
    },
    sendBtn: {
        width: 30,
        height: 30,
        background: fade(theme.palette.primary.main, 0.5),
        "&$buttonDisabled": {
            color: grey[800]
        },
        "&:hover": {
            backgroundColor: theme.palette.primary.main,
        },
        margin: "0.5rem"
    },
    buttonDisabled: {},
}))

export const PlayIconButton = ({addNewComment, isEmpty, IconProps, IconButtonProps, ...props}) => {
    const classes = useStyles({isEmpty})

    return (
        <div {...props}>
            <IconButton
                {...IconButtonProps}
                classes={{root: classes.sendBtn, disabled: classes.buttonDisabled}}
                disabled={isEmpty}
                onClick={() => addNewComment()}>
                <ChevronRightRoundedIcon
                    {...IconProps}
                    className={classes.sendIcon}/>
            </IconButton>
        </div>
    )
}



//example
// const options = [{
//     label: 'Create a merge commit',
//     onClick: () => {
//     }
// }, {
//     label: 'Squash and merge',
//     onClick: () => {
//     }
// }, {
//     label: 'Rebase and merge',
//     onClick: () => {
//
//     }
// }];

export const CustomSplitButton = ({options = [], mainButtonProps, sideButtonProps, ...props}) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);



    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    return (
        <>
            <ButtonGroup {...props} variant="contained" color="primary" ref={anchorRef} aria-label="split button">
                <Button {...mainButtonProps} onClick={options[selectedIndex].onClick}>{options[selectedIndex].label}</Button>
                <Button
                    {...sideButtonProps}
                    color="primary"
                    size="small"
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-label="Select draft create strategy"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                >
                    <ArrowDropDownIcon/>
                </Button>
            </ButtonGroup>
            <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                {({TransitionProps, placement}) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu">
                                    {options.map((option, index) => (
                                        <MenuItem
                                            key={option.label}
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}