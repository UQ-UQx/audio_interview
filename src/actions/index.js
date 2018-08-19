export const Actions = {
    INCREASE_COUNT: 'INCREASE_COUNT',
    DECREASE_COUNT: 'DECREASE_COUNT',
    RESET_COUNT: 'RESET_COUNT',
};

const increaseCount = value => ({
    type: Actions.INCREASE_COUNT,
    payload: {
        value,
    },
});

const decreaseCount = value => ({
    type: Actions.DECREASE_COUNT,
    payload: {
        value,
    },
});

const resetCount = () => ({
    type: Actions.RESET_COUNT,
});

// function are ordered as above
export { increaseCount, decreaseCount, resetCount };
