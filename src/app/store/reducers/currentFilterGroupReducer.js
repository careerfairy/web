import * as actions from '../actions/actionTypes';

const initialState = {
    data: {
        id: "rgdfgfdgfdgw324",
        label: "Eth and Epfl mechanical Engineers",
        filters: [
            {
                groupId: "GXW3MtpTehSmAe0aP1J4",
                filterOptions: [
                    {
                        categoryId: "c8090110-89ec-4287-b561-23f1f6dcb180",
                        targetOptionIds: ["1a66d82d-ee97-43e2-8eac-3d2a51a4127f", "532c6170-c0aa-4638-8c46-4b24aca6fdb0"]
                    },
                    {
                        categoryId: "f4c3e50d-b7bc-4197-9cf0-b2ae45b40586",
                        targetOptionIds: ["eb4d76db-fd99-4ca7-b7a1-a3a87e30ee2e" ]
                    }
                ],
            },
            {
                groupId: "JBjEIACEOW00NvTVozJL",
                filterOptions: [
                    {
                        categoryId: "01b5033c-c456-45ac-acf5-0e83ae67dc4a",
                        targetOptionIds: ["e915f411-7bb2-4cc7-9665-eeca1d3bb449", "c72c1a53-827f-4a07-892d-e1b57b3d7332"]
                    },
                    {
                        categoryId: "259cd82f-76cc-4c4a-85ee-31b606e2995b",
                        targetOptionIds: ["9fc3daa1-13b0-4ea2-abbe-6945a5d44e80", "8fdb0df8-9152-432a-aef5-1d2986afc491"]
                    }
                ],
            },
        ],
    },
    filteredStudents: [],
    saved: false,
    loading: false,
};

const currentFilterGroupReducer = (state = initialState, {type, payload}) => {
    switch (type) {
        case actions.SET_CURRENT_FILTER_GROUP:
            return {...state, data: {...payload}};
        case actions.CLEAR_CURRENT_FILTER_GROUP:
            return {...state, data: null};
        case actions.SET_FILTERS:
            return {...state, data: {...state.data, filters: [...payload]}};
        case actions.LOADING_FILTER_GROUP_START:
            return {...state, loading: true};
        case actions.LOADING_FILTER_GROUP_END:
            return {...state, loading: false};
        default:
            return state;
    }
};

export default currentFilterGroupReducer