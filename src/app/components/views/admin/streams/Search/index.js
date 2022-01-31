import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Paper, TextField } from "@mui/material";

const useStyles = makeStyles((theme) => ({
   searchPaper: {
      padding: theme.spacing(1),
   },
}));

const Search = ({}) => {
   const classes = useStyles();

   return (
      <Paper className={classes.searchPaper}>
         <TextField placeholder="search..." fullWidth variant="outlined" />
      </Paper>
   );
};

export default Search;
