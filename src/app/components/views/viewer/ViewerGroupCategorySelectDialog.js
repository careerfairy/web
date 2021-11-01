import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@material-ui/core";
import PropTypes from "prop-types";
const useStyles = makeStyles((theme) => ({
}));

const Content = ({handleClose, groupsToFollow, groupToUpdateCategories}) => {
const classes = useStyles()

    return (
        <>
            <DialogTitle id="alert-dialog-title">
                {groupsToFollow.length ? "Where Are You Joining From":
                    groupToUpdateCategories? `${groupToUpdateCategories.universityName} Would Like To Know More About you`:
                        ""}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {/*{message}*/}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    // disabled={loading}
                    // endIcon={
                    //     loading && <CircularProgress color="inherit" size={20} />
                    // }
                    onClick={handleClose}
                    variant="contained"
                    color="primary"
                >
                    Confirm
                </Button>
            </DialogActions>
        </>
    )
}

const ViewerGroupCategorySelectDialog = ({
    onClose,
                                             groupsToFollow,
    groupToUpdateCategories
                         }) => {

    const handleClose = () => {
        onClose()
    }
    return (
            <Dialog
                open={Boolean(groupsToFollow?.length || groupToUpdateCategories)}
                onClose={handleClose}
                fullScreen
            >
       <Content groupsToFollow={groupsToFollow?.length} groupToUpdateCategories={groupToUpdateCategories}  handleClose={handleClose} />
            </Dialog>
    );
};

ViewerGroupCategorySelectDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
};


export default ViewerGroupCategorySelectDialog;
