export const Actions = {
    ASK_QUESTION: 'ASK_QUESTION',
    CLEAR_QUESTION: 'CLEAR_QUESTION',

    START_RECORDING: 'START_RECORDING',
    STOP_RECORDING: 'STOP_RECORDING',

    GET_SCREENSHOT: 'GET_SCREENSHOT',

    SET_SAVE_TRUE: 'SET_SAVE_TRUE',
    SET_SAVE_FALSE: 'SET_SAVE_FALSE',
};

export const Tables = {
    QUESTIONS: 'questions',
    CATEGORIES: 'categories',
};

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
    setQuestions,
    askQuestion,
    clearQuestion,
    startRecording,
    stopRecording,
    getScreenshot,
    setSaveTrue,
    setSaveFalse,
};
