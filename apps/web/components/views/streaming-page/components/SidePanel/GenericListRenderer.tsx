import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import React from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import { FixedSizeList } from "react-window"
import { Viewer } from "./Viewer"

export const GenericListRenderer = <T extends UserLivestreamData | string>({
   items,
   itemKey,
}: {
   items: Array<T>
   itemKey: (item: T) => React.Key
}) => {
   const userCount = items.length

   return (
      <AutoSizer>
         {({ height, width }) => (
            <FixedSizeList
               itemSize={66}
               itemCount={userCount}
               height={height}
               width={width}
            >
               {({ style, index }) => (
                  <Viewer
                     key={itemKey(items[index])}
                     memberData={items[index]}
                     style={style}
                  />
               )}
            </FixedSizeList>
         )}
      </AutoSizer>
   )
}
