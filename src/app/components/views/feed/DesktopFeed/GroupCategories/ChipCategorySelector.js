import React, {Fragment} from 'react';
import {Chip, Typography, useMediaQuery, useTheme} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
}));


const ChipCategorySelector = ({category, handleSetSelected}) => {
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

    const renderOptions = category.options?.map((option, index) => {
      return <Chip
                key={option.id || index}
                label={option.name}
                variant="outlined"/>
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
};

export default ChipCategorySelector;
