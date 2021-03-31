import PropTypes from 'prop-types'
import React from 'react';
import {Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import * as actions from '../../../../../../../store/actions'
import {Autocomplete} from "@material-ui/lab";
import AreYouSureModal from "../../../../../../../materialUI/GlobalModals/AreYouSureModal";
import useDeleteFilter from "../../../../../../custom-hook/useDeleteFilter";


const Content = ({handleClose}) => {
    const dispatch = useDispatch()
    const {handlers, message, open} = useDeleteFilter()
    const orderedGroups = useSelector(state => state.firestore.ordered["careerCenterData"].map(group => group.id))
    const mapGroups = useSelector(state => state.firestore.data["careerCenterData"])

    const value = useSelector(state =>
        state.currentFilterGroup.data?.filters
            .map(filter => filter.groupId) || []
    )

    const handleChange = (event, selectedOptions) => {
        dispatch(actions.setFilters(selectedOptions))
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
                                  onDelete={() => handlers.handleClickDelete(option)}
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
                message={message}
                handleClose={handlers.handleCloseAreYouSureModal}
                handleConfirm={handlers.handleConfirm}
                open={open}
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
