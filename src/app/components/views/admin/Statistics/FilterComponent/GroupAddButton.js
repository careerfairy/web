import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Fab} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import GroupAddModal from "./GroupAddModal";

const useStyles = makeStyles(theme => ({
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}));

const GroupAddButton = ({}) => {

    const classes = useStyles()
    const [groupAddModalOpen, setGroupAddModalOpen] = React.useState(false);

    const handleOpenGroupAddModal = () => {
        setGroupAddModalOpen(true)
    }
    const handleCloseGroupAddModal = () => {
        setGroupAddModalOpen(false)
    }

    return (
        <React.Fragment>
            <Fab color="primary" variant="extended" onClick={handleOpenGroupAddModal} aria-label="add">
                <AddIcon className={classes.extendedIcon}/>
                Add or remove a group
            </Fab>
            <GroupAddModal open={groupAddModalOpen} onClose={handleCloseGroupAddModal}/>
        </React.Fragment>
    );
};

export default GroupAddButton;
