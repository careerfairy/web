import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {
    Button, Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl, Input,
    InputLabel, MenuItem,
    Select
} from "@material-ui/core";
import {useSelector} from "react-redux";

const useStyles = makeStyles(theme => ({
    formControl: {
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 2,
    },
    noLabel: {
        marginTop: theme.spacing(3),
    },
}));



const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder',
];

function getStyles(name, personName, theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}
const Content = ({handleClose}) => {
    const orderedGroups = useSelector(state => state.firestore.ordered["careerCenterData"])
    console.log("-> orderedGroups", orderedGroups);

    const classes = useStyles();
    const theme = useTheme();
    const [personName, setPersonName] = React.useState([]);
    console.log("-> personName", personName);

    const handleChange = (event) => {
        setPersonName(event.target.value);
    };


    return (
        <React.Fragment>
            <DialogTitle>
                Add a group to filter
            </DialogTitle>
            <DialogContent>
                <FormControl fullWidth className={classes.formControl}>
                    <InputLabel id="demo-multiple-chip-label">Chip</InputLabel>
                    <Select
                        labelId="demo-multiple-chip-label"
                        id="demo-multiple-chip"
                        multiple
                        value={personName}
                        onChange={handleChange}
                        input={<Input id="select-multiple-chip" />}
                        renderValue={(selected) => (
                            <div className={classes.chips}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} className={classes.chip} />
                                ))}
                            </div>
                        )}
                        MenuProps={MenuProps}
                    >
                        {names.map((name) => (
                            <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Close
                </Button>
            </DialogActions>
        </React.Fragment>
    )
}
Content.propTypes = {
    handleClose: PropTypes.func.isRequired
}

const GroupAddModal = ({open, onClose}) => {

    const handleClose = () => {
        onClose()
    }

    return (
        <Dialog maxWidth="md" fullWidth open={open}>
            <Content handleClose={handleClose}/>
        </Dialog>
    );
};

GroupAddModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
}
export default GroupAddModal;
