import { combineReducers } from 'redux';

import { Actions, Tables } from '../actions';

const questionsListRecordIDReducer = (state = null, action) => {
    switch (action.type) {
        case Actions.GET_SAVED_QUESTIONS_LIST_SUCCESS:
            return action.payload.data[Tables.QUESTIONS].length > 0
                ? action.payload.data[Tables.QUESTIONS][0].id
                : state;
        case Actions.SAVE_QUESTIONS_LIST_SUCCESS:
            return action.payload.data;
        default:
            return state;
    }
};

const questionsListReducer = (state = [], action) => {
    switch (action.type) {
        case Actions.UPDATE_QUESTIONS_LIST:
            return [...action.payload.questions];
        case Actions.GET_SAVED_QUESTIONS_LIST_SUCCESS:
            return action.payload.data[Tables.QUESTIONS].length > 0
                ? [
                      ...JSON.parse(
                          action.payload.data[Tables.QUESTIONS][0].questions
                      ),
                  ]
                : state;
        default:
            return state;
    }
};

const groupsRecordIDReducer = (state = null, action) => {
    switch (action.type) {
        case Actions.GET_SAVED_GROUPS_SUCCESS:
            // console.log(action);
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

const maxAttemptsReducer = (state = 1) =>
    // console.log(action);
    state;

const completedReducer = (state = false, action) => {
    // console.log('completed recuder ', action);
    switch (action.type) {
        case Actions.GET_SAVED_QUESTIONS_LIST_SUCCESS:
            return action.payload.data[Tables.QUESTIONS].length > 0
                ? action.payload.data[Tables.QUESTIONS][0].completed === 1
                : state;
        case Actions.SET_COMPLETED_SUCCESS:
            return true;
        default:
            return state;
    }
};

const submissionsReducer = (state = {}, action) => {
    switch (action.type) {
        case Actions.GET_SUBMISSIONS_SUCCESS:
            return { ...action.payload.data.submissions };
        default:
            return state;
    }
};

const StudentDataReducer = (state = {}, action) => {
    switch (action.type) {
        case Actions.GET_SUBMISSIONS_SUCCESS:
            return { ...action.payload.data.mapped_data };
        case Actions.UPLOAD_STUDENT_DATA_FILES_SUCCESS:
            return { ...action.payload.data };
        default:
            return state;
    }
};

export default combineReducers({
    questionsListRecordID: questionsListRecordIDReducer,
    questionsList: questionsListReducer,
    groupsRecordID: groupsRecordIDReducer,
    groups: groupsReducer,
    question: questionReducer,
    screenshots: screenshotsReducer,
    record: recordReducer,
    save: saveReducer,
    maxAttempts: maxAttemptsReducer,
    completed: completedReducer,
    submissions: submissionsReducer,
    studentData: StudentDataReducer,
});
