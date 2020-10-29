import {Box, Typography, withStyles} from "@material-ui/core";

export const CategoryContainer = withStyles(theme => ({
    root: {
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
    },
}))(Box);

