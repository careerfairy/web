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
   const safeItems = items || []

   const userCount = safeItems.length

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
                     key={itemKey(safeItems[index])}
                     memberData={safeItems[index]}
                     style={style}
                  />
               )}
            </FixedSizeList>
         )}
      </AutoSizer>
   )
}
