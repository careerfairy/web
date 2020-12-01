import React from 'react';
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import InfiniteScroll from "react-infinite-scroll-component";

const CustomInfiniteScroll = ({children, ...props}) => {
    return (
        <InfiniteScroll
            {...props}
            loader={
                <Typography
                    component="div"
                    style={{marginTop: "1rem"}}
                    align="center">
                    <CircularProgress
                        color="primary"/>
                </Typography>}>
            {children}
        </InfiniteScroll>
    );
};

export default CustomInfiniteScroll;