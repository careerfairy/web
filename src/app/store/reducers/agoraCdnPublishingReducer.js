import * as actions from "../actions/actionTypes";

const initialState = null;

const agoraCdnPublishingReducer = (state = initialState, { type }) => {
   switch (type) {
      case actions.SET_CDN_PUBLISHING_STOPPING:
         return "stopping";

      case actions.SET_CDN_PUBLISHING_STOPPED:
         return "stopped";

      case actions.SET_CDN_PUBLISHING_STARTING:
         return "starting";

      case actions.SET_CDN_PUBLISHING_STARTED:
         return "started";

      case actions.SET_CDN_PUBLISHING_ERROR:
         return "error";

      default:
         return state;
   }
};

export default agoraCdnPublishingReducer;
