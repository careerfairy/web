import {dynamicSort} from "../helperFunctions/HelperFunctions";
import {createSelector} from "reselect";


const breakoutRoomsSelector = createSelector(
    breakoutRooms => breakoutRooms,
    (breakoutRooms) => {
        if (breakoutRooms) {
            return [...breakoutRooms].sort(dynamicSort("index", true))
        }
        return breakoutRooms
    }
)
export default breakoutRoomsSelector