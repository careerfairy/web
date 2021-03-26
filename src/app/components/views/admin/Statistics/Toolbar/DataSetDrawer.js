import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Drawer, List, ListItem, ListItemText} from "@material-ui/core";
import {useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";

const useStyles = makeStyles(theme => ({
    drawerPaperRoot:{
        minWidth: 300
    }
}));

const DrawerContent = () => {

    const filterGroups = useSelector(state => state.firestore.ordered.filterGroups || [])
    console.log("-> filterGroups", filterGroups);
    useFirestoreConnect(() => [{
        collection: "filterGroups",
        storeAs: "filterGroups"
    }])

    return (
        <List>
            {filterGroups.map(filterGroup =>
                <ListItem key={filterGroup.id}>
                    <ListItemText>
                        {filterGroup.label}
                    </ListItemText>
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

