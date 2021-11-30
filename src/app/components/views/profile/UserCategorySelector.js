import React from "react";
import { Fragment } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
   Typography,
   useMediaQuery,
   InputLabel,
   MenuItem,
   FormControl,
   Select,
   Chip,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
   },
}));

const UserCategorySelector = ({ category, handleSetSelected, isNew }) => {
   const theme = useTheme();
   const native = useMediaQuery(theme.breakpoints.down("xs"));
   const classes = useStyles();
   const [open, setOpen] = React.useState(false);

   const handleClose = () => {
      setOpen(false);
   };

   const handleOpen = () => {
      setOpen(true);
   };

   const dynamicSort = (property) => {
      let sortOrder = 1;
      if (property[0] === "-") {
         sortOrder = -1;
         property = property.substr(1);
      }
      return function (a, b) {
         /* next line works with strings and numbers,
          * and you may want to customize it to your needs
          */
         const result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
         return result * sortOrder;
      };
   };

   let sortedOptions = [];

   sortedOptions = [...category.options].sort(dynamicSort("name"));

   const renderOptions = sortedOptions.map((option) => {
      if (native) {
         return (
            <option key={option.id} value={option.id}>
               {option.name}
            </option>
         );
      } else {
         return (
            <MenuItem key={option.id} value={option.id}>
               <Typography variant="inherit" noWrap>
                  {option.name}
               </Typography>
            </MenuItem>
         );
      }
   });

   return (
      <Fragment>
         <FormControl
            style={{ width: native ? "100%" : "100%" }}
            className={classes.formControl}
         >
            <InputLabel id="demo-controlled-open-select-label">
               {category.name}
            </InputLabel>
            <Select
               open={open}
               fullWidth
               startAdornment={isNew && <Chip color="primary" label={"New!"} />}
               native={native}
               onClose={handleClose}
               onOpen={handleOpen}
               value={category.selectedValueId}
               onChange={(e) => handleSetSelected(category.id, e)}
            >
               {native && <option disabled hidden value="" />}
               {renderOptions}
            </Select>
         </FormControl>
      </Fragment>
   );
};
export default UserCategorySelector;
