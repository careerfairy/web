import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as actions from "../../store/actions";

const message = "The group you're try to delete has active filters, once deleted, those filters will be permanently gone"

const useDeleteFilter = () => {
    const currentFilterGroup = useSelector(state => state.currentFilterGroup)
    const value = useSelector(state =>
        state.currentFilterGroup.data?.filters
            .map(filter => filter.groupId) || []
    )
    const [groupIdToRemove, setGroupIdToRemove] = React.useState("");
    const dispatch = useDispatch()

    const handleOpenAreYouSureModal = React.useCallback((groupId) => setGroupIdToRemove(groupId), [])

    const handleCloseAreYouSureModal = () => setGroupIdToRemove("")

    const handleDelete = React.useCallback((groupId) => {
        const targetIdToRemove = groupId || groupIdToRemove
        dispatch(actions.setFilters(value.filter(groupId => groupId !== targetIdToRemove)))
    }, [groupIdToRemove, dispatch, value])


    const handlers = React.useMemo(() => ({
        handleClickDelete: (groupId) => {
            const hasActiveFilters = currentFilterGroup.data.filters.some(filterObject => {
                return Boolean(filterObject.groupId === groupId && filterObject.filterOptions.length)
            })
            return hasActiveFilters ? handleOpenAreYouSureModal(groupId) : handleDelete(groupId)
        },
        handleConfirm: () => {
            handleDelete()
            handleCloseAreYouSureModal()
        },
        handleCloseAreYouSureModal
    }), [currentFilterGroup, groupIdToRemove, handleDelete, handleOpenAreYouSureModal])

    return {handlers, message, open: Boolean(groupIdToRemove)}
};

export default useDeleteFilter;
