import { combineReducers } from 'redux';

import { Actions, Tables } from '../actions';

const groupsRecordIDReducer = (state = null, action) => {
    switch (action.type) {
        case Actions.GET_SAVED_GROUPS_SUCCESS:
            console.log(action);
            return action.payload.data[Tables.GROUPS].length > 0
                ? action.payload.data[Tables.GROUPS][0].id
                : state;
        case Actions.SAVE_GROUPS_SUCCESS:
            return action.payload.data;
        default:
            return state;
    }
};

const groupsReducer = (state = [], action) => {
    switch (action.type) {
        case Actions.UPDATE_GROUPS:
            return [...action.payload.groups];
        case Actions.GET_SAVED_GROUPS_SUCCESS:
            return action.payload.data[Tables.GROUPS].length > 0
                ? [...JSON.parse(action.payload.data[Tables.GROUPS][0].groups)]
                : state;
        default:
            return state;
    }
};

const questionReducer = (state = '', action) => {
    switch (action.type) {
        case Actions.ASK_QUESTION:
            return action.payload.question;
        case Actions.CLEAR_QUESTION:
            return '';
        default:
            return state;
    }
};

const screenshotsReducer = (state = [], action) => {
    switch (action.type) {
        case Actions.GET_SCREENSHOT:
            return [...state, action.payload.screenshot];
        default:
            return [...state];
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
    groupsRecordID: groupsRecordIDReducer,
    groups: groupsReducer,
    question: questionReducer,
    screenshots: screenshotsReducer,
    record: recordReducer,
    save: saveReducer,
});
