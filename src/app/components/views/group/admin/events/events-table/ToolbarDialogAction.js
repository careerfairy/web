import { Button, Box } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import React from "react";

const ToolbarDialogAction = ({ onClick, tooltip }) => {
   return (
      <Box display="flex" height={44} alignItems="center">
         <Button
            variant="contained"
            onClick={onClick}
            size="large"
            startIcon={<AddIcon />}
            color="primary"
            aria-label="toolbar-dialog-action"
         >
            {tooltip}
         </Button>
      </Box>
   );
};

export default ToolbarDialogAction;
