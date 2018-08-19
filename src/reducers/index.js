import { combineReducers } from 'redux';

import { Actions } from '../actions';

const defaultCount = 0;
const countReducer = (state = defaultCount, action) => {
    switch (action.type) {
        case Actions.INCREASE_COUNT:
            return state + action.payload.value;
        case Actions.DECREASE_COUNT:
            return state - action.payload.value;
        case Actions.RESET_COUNT:
            return defaultCount;
        default:
            return state;
    }
};

export default combineReducers({
    count: countReducer,
});
