import PropTypes from 'prop-types'
import React, {memo} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import User from "./User";

const useStyles = makeStyles(theme => ({}));

const UserList = ({audience}) => {

    const classes = useStyles()
    const talentPoolMap = {}

    return (
        <div style={{flex: '1 1 auto'}}>
            <AutoSizer>
                {({height, width}) => (
                    <FixedSizeList
                        itemSize={64}
                        itemCount={audience.length} height={height} width={width}
                        // className={classes.list}
                    >
                        {({style, index}) => <User
                            style={style}
                            key={index}
                            inTalentPool={Boolean(talentPoolMap[audience[index]?.id])}
                            user={audience[index]}/>}
                    </FixedSizeList>
                )}
            </AutoSizer>
        </div>
    );
};


UserList.propTypes = {
  audience: PropTypes.array.isRequired
}
export default memo(UserList);
