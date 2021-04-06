import React from 'react';
import {Button} from "@material-ui/core";
import GroupAddModal from "./GroupAddModal";

const GroupAddButton = () => {

    const [groupAddModalOpen, setGroupAddModalOpen] = React.useState(false);

    const handleOpenGroupAddModal = () => {
        setGroupAddModalOpen(true)
    }
    const handleCloseGroupAddModal = () => {
        setGroupAddModalOpen(false)
    }

    return (
        <React.Fragment>
                <Button
                    disabled={groupAddModalOpen}
                    color="primary"
                    variant="contained"
                    onClick={handleOpenGroupAddModal}
                    aria-label="add"
                >
                    Add or remove some groups
                </Button>
            <GroupAddModal open={groupAddModalOpen} onClose={handleCloseGroupAddModal}/>
        </React.Fragment>
    );
};

export default GroupAddButton;
