import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Fab, Tooltip} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import GroupAddModal from "./GroupAddModal";

const useStyles = makeStyles(theme => ({
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
            <Tooltip title="Add or remove a group">
                <Fab
                    disabled={groupAddModalOpen}
                    color="primary"
                    onClick={handleOpenGroupAddModal}
                    aria-label="add"
                >
                    <AddIcon/>
                </Fab>
            </Tooltip>
            <GroupAddModal open={groupAddModalOpen} onClose={handleCloseGroupAddModal}/>
        </React.Fragment>
    );
};

export default GroupAddButton;
