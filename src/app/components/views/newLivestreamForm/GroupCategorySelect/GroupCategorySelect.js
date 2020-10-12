import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Chip, TextField, Typography} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
    root: {
        paddingBottom: 0,
        paddingTop: 14,

    },
    card: {
        // padding: "1em",
        overflow: "auto",
    },
    actions: {
        display: "flex",
        flexFlow: "column",
    },

}));
const GroupCategorySelect = ({group, handleSetGroupCategories}) => {

    const handleMultiSelect = (event, selectedOptions) => {
        const optionIdsArray = selectedOptions.map(option => option.id)
        handleSetGroupCategories(group.groupId, optionIdsArray)
    }

    const label = group.flattenedOptions.length ? `${group.universityName} Options` : `${group.universityName} has no options`

    return (
        <Autocomplete
            id="groupIds"
            name="groupIds"
            multiple
            disabled={!group.flattenedOptions.length}
            options={group.flattenedOptions || []}
            onChange={handleMultiSelect}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
                <TextField {...params} variant="outlined" label={label}
                           placeholder="Add another option"/>
            )}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip color="primary"
                          variant="default"
                          label={option.name}
                          {...getTagProps({index})}
                    />
                ))
            }
        />
    );
};

export default GroupCategorySelect;
