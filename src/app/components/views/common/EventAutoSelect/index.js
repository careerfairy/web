import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import EventOptionPreview from "./EventOptionPreview";

const useStyles = makeStyles((theme) => ({
   root: {},
}));
const EventAutoSelect = ({
   onChange,
   value,
   inputValue,
   onInputChange,
   options,
   ...rest
}) => {
   const classes = useStyles();
   return (
      <Autocomplete
         value={value}
         onChange={onChange}
         inputValue={inputValue}
         onInputChange={onInputChange}
         getOptionSelected={(option, value) =>
            option.title === value.title || option.company === value.company
         }
         filterSelectedOptions
         getOptionLabel={(option) => option.title || ""}
         id="event-select-menu"
         renderOption={(option) => <EventOptionPreview streamData={option} />}
         options={options}
         renderInput={(params) => (
            <TextField {...params} label="Chose an Event" variant="outlined" />
         )}
         {...rest}
      />
   );
};

export default EventAutoSelect;
