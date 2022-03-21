import PropTypes from "prop-types"
import React, { memo } from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import { FixedSizeList } from "react-window"
import User from "./User"

const UserList = ({ audience, isStreamer }) => {
   return (
      <div style={{ flex: "1 1 auto" }}>
         <AutoSizer>
            {({ height, width }) => (
               <FixedSizeList
                  itemSize={70}
                  itemCount={audience.length}
                  height={height}
                  width={width}
               >
                  {({ style, index }) => (
                     <User
                        style={style}
                        key={audience[index].id}
                        isStreamer={isStreamer}
                        inTalentPool={Boolean(
                           isStreamer && audience[index]?.inTalentPool
                        )}
                        user={audience[index]}
                     />
                  )}
               </FixedSizeList>
            )}
         </AutoSizer>
      </div>
   )
}

UserList.propTypes = {
   // audience: PropTypes.array.isRequired,
   isStreamer: PropTypes.bool.isRequired,
}
export default memo(UserList)
