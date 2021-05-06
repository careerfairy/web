import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import React from "react";
import ChannelMember from "./ChannelMember";

const UserList = ({members, loadMore, hasMore}) => {
    const itemCount = hasMore ? members.length + 1 : members.length;
    return (
        <div style={{flex: '1 1 auto'}}>
            <InfiniteLoader
                isItemLoaded={index => index < members.length}
                itemCount={itemCount}
                loadMoreItems={loadMore}
            >
                {({onItemsRendered, ref}) => (
                    <AutoSizer>
                        {({height, width}) => (
                            <FixedSizeList
                                itemSize={70}
                                ref={ref}
                                onItemsRendered={onItemsRendered}
                                itemCount={itemCount}
                                height={height}
                                width={width}
                            >
                                {({style, index}) => <ChannelMember members={members} index={index}
                                                                    memberData={members[index]} style={style}/>}
                            </FixedSizeList>
                        )}
                    </AutoSizer>
                )}
            </InfiniteLoader>
        </div>
    );
};

export default UserList