import React from 'react';
import {Fragment} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {Typography, useMediaQuery, useTheme} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
}));

const UserCategorySelector = ({category, handleSetSelected}) => {
    const theme = useTheme();
    const native = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const renderOptions = category.options?.map(option => {
        if (native) {
            return <option key={option.id} value={option.id}>
                {option.name}
            </option>
        } else {
            return <MenuItem key={option.id} value={option.id}>
                <Typography variant="inherit" noWrap>
                    {option.name}
                </Typography>
            </MenuItem>
        }
    })


    return (
        <Fragment>
            <FormControl style={{width: native ? '100%' : '100%' }} className={classes.formControl}>
                <InputLabel id="demo-controlled-open-select-label">{category.name}</InputLabel>
                <Select
                    open={open}
                    fullWidth
                    native={native}
                    onClose={handleClose}
                    onOpen={handleOpen}
                    value={category.selectedValueId}
                    onChange={(e) => handleSetSelected(category.id, e)}
                >
                    {native && <option disabled hidden value=""/>}
                    {renderOptions}
                </Select>
            </FormControl>
        </Fragment>
    );
}
export default UserCategorySelector;