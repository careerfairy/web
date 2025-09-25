import React, { memo } from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import { FixedSizeList } from "react-window"
import User from "./User"
import { UserLivestreamData } from "@careerfairy/shared-lib/dist/livestreams"

interface Props {
   audience: UserLivestreamData[]
   isStreamer: boolean
}
const UserList = memo(({ audience, isStreamer }: Props) => {
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
                        inTalentPool={Boolean(
                           isStreamer && audience[index]?.talentPool?.date
                        )}
                        user={audience[index].user}
                     />
                  )}
               </FixedSizeList>
            )}
         </AutoSizer>
      </div>
   )
})

UserList.displayName = "UserList"

export default UserList
