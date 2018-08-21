export const Actions = {
    SET_SAVE_TRUE: 'SET_SAVE_TRUE',
    SET_SAVE_FALSE: 'SET_SAVE_FALSE',
    START_RECORDING: 'START_RECORDING',
    STOP_RECORDING: 'STOP_RECORDING',
};

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

const startRecording = () => ({
    type: Actions.START_RECORDING,
});

const stopRecording = () => ({
    type: Actions.STOP_RECORDING,
});

// function are ordered as above
export { setSaveTrue, setSaveFalse, startRecording, stopRecording };
