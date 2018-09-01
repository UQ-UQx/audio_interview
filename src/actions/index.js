import moment from 'moment';

export const Actions = {
    GET_SAVED_GROUPS_START: 'GET_SAVED_GROUPS_START',
    GET_SAVED_GROUPS_SUCCESS: 'GET_SAVED_GROUPS_SUCCESS',
    GET_SAVED_GROUPS_ERROR: 'GET_SAVED_GROUPS_ERROR',

    SAVE_GROUPS_START: 'SAVE_GROUPS_START',
    SAVE_GROUPS_SUCESS: 'SAVE_GROUPS_SUCESS',
    SAVE_GROUPS_ERROR: 'SAVE_GROUPS_ERROR',

    UPDATE_GROUPS: 'UPDATE_GROUPS',

    ASK_QUESTION: 'ASK_QUESTION',
    CLEAR_QUESTION: 'CLEAR_QUESTION',

    START_RECORDING: 'START_RECORDING',
    STOP_RECORDING: 'STOP_RECORDING',

    GET_SCREENSHOT: 'GET_SCREENSHOT',

    SET_SAVE_TRUE: 'SET_SAVE_TRUE',
    SET_SAVE_FALSE: 'SET_SAVE_FALSE',
};

export const Tables = {
    GROUPS: 'interview_question_groups',
};

const getSavedGroups = () => {
    const condition1 = `course_id,eq,${$LTI.courseID}`;
    const condition2 = `resource_id,eq,${$LTI.id}`;

    const conditions = [condition1, condition2];

    return {
        types: [
            Actions.GET_SAVED_GROUPS_START,
            Actions.GET_SAVED_GROUPS_SUCCESS,
            Actions.GET_SAVED_GROUPS_ERROR,
        ],
        payload: {
            request: {
                method: 'get',
                url: `/${Tables.GROUPS}`,
                params: {
                    filter: conditions,
                    transform: 1,
                },
            },
        },
    };
};

const saveGroups = groups => (dispatch, getState) => {
    const { groupsRecordID } = getState();

    const created = moment().format('YYYY-MM-DD HH:mm:ss');
    const updated = moment().format('YYYY-MM-DD HH:mm:ss');

    const recordExists =
        groupsRecordID === null || groupsRecordID === undefined;

    const data = {
        ...(recordExists ? { course_id: $LTI.courseID } : {}),
        ...(recordExists ? { resource_id: $LTI.id } : {}),
        groups: JSON.stringify(groups),
        ...(recordExists ? { created } : {}),
        updated,
    };

    const request = {
        request: {
            method: recordExists ? 'POST' : 'PUT',
            url: `/${Tables.GROUPS}${recordExists ? '' : `/${groupsRecordID}`}`,
            data,
            params: {
                transform: 1,
            },
        },
    };

    return new Promise((resolve, reject) => {
        dispatch({
            types: [
                Actions.SAVE_GROUPS_START,
                Actions.SAVE_GROUPS_SUCESS,
                Actions.SAVE_GROUPS_ERROR,
            ],
            data, // this is so i can access the data without having to dig too deep into the request tree
            payload: request,
        })
            .then(response => {
                resolve(response);
            })
            .catch(err => {
                reject(err);
            });
    });
};

const updateGroups = groups => ({
    type: Actions.UPDATE_GROUPS,
    payload: {
        groups,
    },
});

const setQuestions = questions => ({
    type: Actions.SET_QUESTIONS,
    payload: {
        questions,
    },
});

const askQuestion = question => ({
    type: Actions.ASK_QUESTION,
    payload: {
        question,
    },
});

const clearQuestion = () => {
    console.log('clearing');
    return {
        type: Actions.CLEAR_QUESTION,
    };
};

const startRecording = () => ({
    type: Actions.START_RECORDING,
});

const stopRecording = () => ({
    type: Actions.STOP_RECORDING,
});

const getScreenshot = screenshot => ({
    type: Actions.GET_SCREENSHOT,
    payload: {
        screenshot,
    },
});

/**
 * Action Creator:
 *
 * sets EDIT flag to be true
 *
 * @returns action object to be dispatched
 */
const setSaveTrue = () => ({
    type: Actions.SET_SAVE_TRUE,
});

/**
 * Action Creator:
 *
 * sets EDIT flag to be false
 *
 * @returns action object to be dispatched
 */
const setSaveFalse = () => ({
    type: Actions.SET_SAVE_FALSE,
});

// function are ordered as above
export {
    getSavedGroups,
    saveGroups,
    updateGroups,
    setQuestions,
    askQuestion,
    clearQuestion,
    startRecording,
    stopRecording,
    getScreenshot,
    setSaveTrue,
    setSaveFalse,
};
