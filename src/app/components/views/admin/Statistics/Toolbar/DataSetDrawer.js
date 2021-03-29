import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Drawer, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText} from "@material-ui/core";
import {useFirestoreConnect} from "react-redux-firebase";
import {useDispatch, useSelector} from "react-redux";
import * as actions from "../../../../../store/actions"
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles(theme => ({
    drawerPaperRoot: {
        minWidth: 300
    },
    inline: {
        display: "inline"
    }
}));

const DrawerContent = () => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const filterGroups = useSelector(state => state.firestore.ordered.filterGroups || [])
    useFirestoreConnect(() => [{
        collection: "filterGroups",
        storeAs: "filterGroups"
    }])

    const handleDeleteFilterGroup = (filterGroupId) => dispatch(actions.deleteFilterGroup(filterGroupId))
    const handleSetFilterGroupAsCurrent = (filterGroupId) => dispatch(actions.setFilterGroupAsCurrentWithId(filterGroupId))

    return (
        <List>
            {filterGroups.map(({id, label, filteredStudentsData, totalStudentsData}) =>
                <ListItem onClick={() => handleSetFilterGroupAsCurrent(id)} button key={id}>
                    <ListItemText
                        primary={label || "Untitled Query Group"}
                        secondary={
                            <React.Fragment>
                                Filtered: {filteredStudentsData.count}
                                <br/>
                                Total: {totalStudentsData.count}
                            </React.Fragment>
                        }
                    />

                    <ListItemSecondaryAction>
                        <IconButton
                            onClick={() => handleDeleteFilterGroup(id)}
                            edge="end"
                            aria-label="delete"
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>)}
        </List>
    )

}
const DataSetDrawer = ({onClose, open}) => {
    const classes = useStyles()
    const handleClose = () => {
        onClose()
    }
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{className: classes.drawerPaperRoot}}
        >
            <DrawerContent/>
        </Drawer>
    );
};
DataSetDrawer.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
}

export default DataSetDrawer;

