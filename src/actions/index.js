import moment from 'moment';

export const Actions = {
    GET_SAVED_QUESTIONS_LIST_START: 'GET_SAVED_QUESTIONS_LIST_START',
    GET_SAVED_QUESTIONS_LIST_SUCCESS: 'GET_SAVED_QUESTIONS_LIST_SUCCESS',
    GET_SAVED_QUESTIONS_LIST_ERROR: 'GET_SAVED_QUESTIONS_LIST_ERROR',

    SET_COMPLETED_START: 'SET_COMPLETED_START',
    SET_COMPLETED_SUCCESS: 'SET_COMPLETED_SUCCESS',
    SET_COMPLETED_ERROR: 'SET_COMPLETED_ERROR',

    SAVE_QUESTIONS_LIST_START: 'SAVE_QUESTIONS_LIST_START',
    SAVE_QUESTIONS_LIST_SUCCESS: 'SAVE_QUESTIONS_LIST_SUCCESS',
    SAVE_QUESTIONS_LIST_ERROR: 'SAVE_QUESTIONS_LIST_ERROR',

    GET_SAVED_GROUPS_START: 'GET_SAVED_GROUPS_START',
    GET_SAVED_GROUPS_SUCCESS: 'GET_SAVED_GROUPS_SUCCESS',
    GET_SAVED_GROUPS_ERROR: 'GET_SAVED_GROUPS_ERROR',

    SAVE_GROUPS_START: 'SAVE_GROUPS_START',
    SAVE_GROUPS_SUCCESS: 'SAVE_GROUPS_SUCCESS',
    SAVE_GROUPS_ERROR: 'SAVE_GROUPS_ERROR',

    UPDATE_QUESTIONS_LIST: 'UPDATE_QUESTIONS_LIST',
    UPDATE_GROUPS: 'UPDATE_GROUPS',

    ASK_QUESTION: 'ASK_QUESTION',
    CLEAR_QUESTION: 'CLEAR_QUESTION',

    START_RECORDING: 'START_RECORDING',
    STOP_RECORDING: 'STOP_RECORDING',

    GET_SCREENSHOT: 'GET_SCREENSHOT',

    SET_SAVE_TRUE: 'SET_SAVE_TRUE',
    SET_SAVE_FALSE: 'SET_SAVE_FALSE',

    GET_SUBMISSIONS_START: 'GET_SUBMISSIONS_START',
    GET_SUBMISSIONS_SUCCESS: 'GET_SUBMISSIONS_SUCCESS',
    GET_SUBMISSIONS_ERROR: 'GET_SUBMISSIONS_ERROR',

    UPLOAD_STUDENT_DATA_FILES_START: 'UPLOAD_STUDENT_DATA_FILES_START',
    UPLOAD_STUDENT_DATA_FILES_SUCCESS: 'UPLOAD_STUDENT_DATA_FILES_SUCCESS',
    UPLOAD_STUDENT_DATA_FILES_ERROR: 'UPLOAD_STUDENT_DATA_FILES_ERROR',
};

export const Tables = {
    GROUPS: 'interview_question_groups',
    QUESTIONS: 'questions_list',
};

const uploadStudentDataFiles = ({ profile, anon }) => {
    console.log('WOAH', $LTI.courseID);

    const postData = new FormData();
    postData.append('action', 'uploadStudentData');
    postData.append('jwt_token', $JWT_TOKEN);
    postData.append('file[profile]', profile);
    postData.append('file[anon]', anon);
    postData.append('ltiID', $LTI.id);
    postData.append('courseID', $LTI.courseID);

    return {
        types: [
            Actions.UPLOAD_STUDENT_DATA_FILES_START,
            Actions.UPLOAD_STUDENT_DATA_FILES_SUCCESS,
            Actions.UPLOAD_STUDENT_DATA_FILES_ERROR,
        ],
        payload: {
            client: 'activityAPI', // here you can define client used
            request: {
                method: 'post',
                data: postData,
            },
        },
    };
};

const getSubmissions = () => {
    console.log($LTI.courseID);
    return {
        types: [
            Actions.GET_SUBMISSIONS_START,
            Actions.GET_SUBMISSIONS_SUCCESS,
            Actions.GET_SUBMISSIONS_ERROR,
        ],
        payload: {
            client: 'activityAPI', // here you can define client used
            request: {
                method: 'get',
                params: {
                    action: 'getSubmissions',
                    jwt_token: $JWT_TOKEN,
                    data: {
                        courseID: $LTI.courseID,
                        ltiID: $LTI.id,
                    },
                },
            },
        },
    };
};

const getSavedQuestionsList = () => {
    const condition1 = `course_id,eq,${$LTI.courseID}`;
    const condition2 = `resource_id,eq,${$LTI.id}`;
    const condition3 = `user_id,eq,${$LTI.userID}`;

    const conditions = [condition1, condition2, condition3];

    return {
        types: [
            Actions.GET_SAVED_QUESTIONS_LIST_START,
            Actions.GET_SAVED_QUESTIONS_LIST_SUCCESS,
            Actions.GET_SAVED_QUESTIONS_LIST_ERROR,
        ],
        payload: {
            request: {
                method: 'get',
                url: `/${Tables.QUESTIONS}`,
                params: {
                    filter: conditions,
                    transform: 1,
                },
            },
        },
    };
};

const setCompletedTrue = () => (dispatch, getState) => {
    const { questionsListRecordID } = getState();

    const updated = moment()
        .utc()
        .format('YYYY-MM-DD HH:mm:ss');

    const recordDoesNotExist =
        questionsListRecordID === null || questionsListRecordID === undefined;

    const data = {
        updated,
        completed: 1,
    };

    const request = {
        request: {
            method: recordDoesNotExist ? 'POST' : 'PUT',
            url: `/${Tables.QUESTIONS}${
                recordDoesNotExist ? '' : `/${questionsListRecordID}`
            }`,
            data,
            params: {
                transform: 1,
            },
        },
    };

    // console.log('FIREED');
    return new Promise((resolve, reject) => {
        dispatch({
            types: [
                Actions.SET_COMPLETED_START,
                Actions.SET_COMPLETED_SUCCESS,
                Actions.SET_COMPLETED_ERROR,
            ],
            data, // this is so i can access the data without having to dig too deep into the request tree
            payload: request,
        })
            .then(response => {
                // console.log('RESOLVED');

                resolve(response);
            })
            .catch(err => {
                // console.log('ERRORED');

                reject(err);
            });
    });
};

const saveQuestionsList = (list = []) => (dispatch, getState) => {
    const { questionsListRecordID } = getState();

    const created = moment()
        .utc()
        .format('YYYY-MM-DD HH:mm:ss');
    const updated = moment()
        .utc()
        .format('YYYY-MM-DD HH:mm:ss');

    const recordDoesNotExist =
        questionsListRecordID === null || questionsListRecordID === undefined;

    const data = {
        ...(recordDoesNotExist ? { course_id: $LTI.courseID } : {}),
        ...(recordDoesNotExist ? { resource_id: $LTI.id } : {}),
        ...(recordDoesNotExist ? { user_id: $LTI.userID } : {}),
        questions: JSON.stringify(list),
        ...(recordDoesNotExist ? { created } : {}),
        updated,
        ...(recordDoesNotExist ? { attempted: 0 } : {}),
        ...(recordDoesNotExist ? { completed: 0 } : {}),
    };

    const request = {
        request: {
            method: recordDoesNotExist ? 'POST' : 'PUT',
            url: `/${Tables.QUESTIONS}${
                recordDoesNotExist ? '' : `/${questionsListRecordID}`
            }`,
            data,
            params: {
                transform: 1,
            },
        },
    };

    return new Promise((resolve, reject) => {
        dispatch({
            types: [
                Actions.SAVE_QUESTIONS_LIST_START,
                Actions.SAVE_QUESTIONS_LIST_SUCCESS,
                Actions.SAVE_QUESTIONS_LIST_ERROR,
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

const saveGroups = (groups = []) => (dispatch, getState) => {
    const { groupsRecordID } = getState();

    const created = moment()
        .utc()
        .format('YYYY-MM-DD HH:mm:ss');
    const updated = moment()
        .utc()
        .format('YYYY-MM-DD HH:mm:ss');

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
                Actions.SAVE_GROUPS_SUCCESS,
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

const updateQuestions = questions => ({
    type: Actions.UPDATE_QUESTIONS_LIST,
    payload: {
        questions,
    },
});

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

const clearQuestion = () =>
    // console.log('clearing');
    ({
        type: Actions.CLEAR_QUESTION,
    });

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
    uploadStudentDataFiles,
    getSubmissions,
    getSavedQuestionsList,
    saveQuestionsList,
    getSavedGroups,
    saveGroups,
    updateQuestions,
    updateGroups,
    setQuestions,
    askQuestion,
    clearQuestion,
    startRecording,
    stopRecording,
    getScreenshot,
    setSaveTrue,
    setSaveFalse,
    setCompletedTrue,
};
