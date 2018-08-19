export const Actions = {
    SET_SAVE_TRUE: 'SET_SAVE_TRUE',
    SET_SAVE_FALSE: 'SET_SAVE_FALSE',

    INCREASE_COUNT: 'INCREASE_COUNT',
    DECREASE_COUNT: 'DECREASE_COUNT',
    RESET_COUNT: 'RESET_COUNT',
    SET_DEFAULT_COUNT: 'SET_DEFAULT_COUNT',
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

/**
 * Action Creator:
 *
 * increases count by given value
 *
 * @param value Int
 *
 * @returns action object to be dispatched
 */
const increaseCount = value => ({
    type: Actions.INCREASE_COUNT,
    payload: {
        value,
    },
});

/**
 * Action Creator:
 *
 * decreases count by given value
 *
 * @param value Int
 *
 * @returns action object to be dispatched
 */
const decreaseCount = value => ({
    type: Actions.DECREASE_COUNT,
    payload: {
        value,
    },
});

/**
 * Action Creator:
 *
 * resets count by assinging dispatching an action with the defaultCount
 *
 * when reset count is called, the action uses redux thunk to
 * dispatch the defaultCount variable
 *
 * Read about https://github.com/reduxjs/redux-thunk to understand
 * more about what this action is doing
 *
 * @returns action object to be dispatched
 */
const resetCount = () => (dispatch, getState) => {
    const { defaultCount } = getState();
    dispatch({
        type: Actions.RESET_COUNT,
        payload: {
            value: defaultCount,
        },
    });
};

/**
 * Action Creator:
 *
 * sets the default count value with the given value
 *
 * @param value Int
 *
 * @returns action object to be dispatched
 */
const setCountDefault = value => ({
    type: Actions.SET_DEFAULT_COUNT,
    payload: {
        value,
    },
});

// function are ordered as above
export {
    setSaveTrue,
    setSaveFalse,
    increaseCount,
    decreaseCount,
    resetCount,
    setCountDefault,
};
