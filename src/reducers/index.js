import { combineReducers } from 'redux';

import { Actions } from '../actions';

const screenshotsReducer = (state = [], action) => {
    switch (action.type) {
        case Actions.GET_SCREENSHOT:
            return [...state, action.payload.screenshot];
        default:
            return state;
    }
};

const recordReducer = (state = false, action) => {
    console.log(action);
    switch (action.type) {
        case Actions.START_RECORDING:
            return true;
        case Actions.STOP_RECORDING:
            return false;
        default:
            return state;
    }
};
const saveReducer = (state = false, action) => {
    switch (action.type) {
        case Actions.SET_SAVE_TRUE:
            return true;
        case Actions.SET_SAVE_FALSE:
            return false;
        default:
            return state;
    }
};

export default combineReducers({
    screenshots: screenshotsReducer,
    record: recordReducer,
    save: saveReducer,
});
