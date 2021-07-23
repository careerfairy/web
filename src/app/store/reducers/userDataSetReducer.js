import * as actions from "../actions/actionTypes";

const initialState = {
   total: {
      ordered: undefined,
      mapped: undefined,
   },
   filtered: {
      ordered: undefined,
      mapped: undefined,
   },
};

const userDataSetReducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case actions.SET_USER_DATA_SET:
         return {
            ...state,
            total: {
               ...state.total,
               mapped: payload.mapped,
               ordered: payload.ordered,
            },
         };
      case actions.SET_FILTERED_USER_DATA_SET:
         return {
            ...state,
            filtered: {
               ...state.total,
               mapped: payload.mapped,
               ordered: payload.ordered,
            },
         };
      case actions.CLEAR_USER_DATA_SET:
         return { ...initialState };

      default:
         return state;
   }
};

export default userDataSetReducer;
