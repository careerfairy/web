import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/AddSharp";
import {Button} from "@material-ui/core";
import CategoryAddModal from "./CategoryAddModal";

const useStyles = makeStyles(theme => ({}));

const AddOrRemoveCategoryButton = (props) => {
    const [open, setOpen] = React.useState(false);
    const classes = useStyles()
    const handleClose = () => setOpen(false)
    const handleOpen = () => setOpen(true)

    return (
        <React.Fragment>
            <Button
                onClick={handleOpen}
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
            >
                Add or remove categories
            </Button>
            <CategoryAddModal
                handleClose={handleClose}
                {...props}
                open={open}/>
        </React.Fragment>
    );
};

AddOrRemoveCategoryButton.propTypes = {
    filterOptions: PropTypes.arrayOf(PropTypes.shape({
        categoryId: PropTypes.string,
        targetOptionIds: PropTypes.arrayOf(PropTypes.string),
    })).isRequired,
    groupCategories: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
    })).isRequired
}
export default AddOrRemoveCategoryButton;

