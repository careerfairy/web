import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import * as actions from '../../../../../store/actions'
import {Autocomplete} from "@material-ui/lab";
import AreYouSureModal from "../../../../../materialUI/GlobalModals/AreYouSureModal";

const useStyles = makeStyles(theme => ({}));


const Content = ({handleClose}) => {
    const dispatch = useDispatch()
    const [groupIdToRemove, setGroupIdToRemove] = React.useState("");
    const currentFilterGroup = useSelector(state => state.currentFilterGroup)
    const orderedGroups = useSelector(state => state.firestore.ordered["careerCenterData"].map(group => group.id))
    const mapGroups = useSelector(state => state.firestore.data["careerCenterData"])

    const value = useSelector(state =>
        state.currentFilterGroup.data?.filters
            .map(filter => filter.groupId) || []
    )


    const handleChange = (event, selectedOptions) => {
        dispatch(actions.setFilterOptions(selectedOptions))
    }

    const handleDelete = (groupId) => {
        const targetIdToRemove = groupId || groupIdToRemove
        dispatch(actions.setFilterOptions(value.filter(groupId => groupId !== targetIdToRemove)))
    }

    const handleClickDelete = (groupId) => {
        const hasActiveFilters = currentFilterGroup.data.filters.some(filterObject => {
            return Boolean(filterObject.groupId === groupId && filterObject.filterOptions.length)
        })
        return hasActiveFilters ? handleOpenAreYouSureModal(groupId) : handleDelete(groupId)
    }

    const handleOpenAreYouSureModal = (groupId) => setGroupIdToRemove(groupId)
    const handleCloseAreYouSureModal = () => setGroupIdToRemove("")

    const handleConfirm = () => {
        handleDelete()
        handleCloseAreYouSureModal()
    }


    return (
        <React.Fragment>
            <DialogTitle>
                Add a group to filter
            </DialogTitle>
            <DialogContent>
                <Autocomplete
                    multiple
                    id="tags-outlined"
                    options={orderedGroups}
                    value={value}
                    onChange={handleChange}
                    getOptionLabel={(option) => mapGroups[option].universityName}
                    disableClearable
                    defaultValue={[orderedGroups[0]]}
                    filterSelectedOptions
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label="filterSelectedOptions"
                            placeholder="Favorites"
                        />
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip variant="default"
                                  label={mapGroups[option].universityName}
                                  {...getTagProps({index})}
                                  onDelete={() => handleClickDelete(option)}
                            />
                        ))
                    }
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Close
                </Button>
            </DialogActions>
            <AreYouSureModal
                message="The group you're try to delete has active filters, once deleted, those filters will be permanently gone"
                handleClose={handleCloseAreYouSureModal}
                handleConfirm={handleConfirm}
                open={Boolean(groupIdToRemove)}
            />
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
