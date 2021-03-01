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
                        itemSize={70}
                        itemCount={audience.length} height={height} width={width}
                    >
                        {({style, index}) => <User
                            style={style}
                            key={index}
                            inTalentPool={audience[index]?.inTalentPool}
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
