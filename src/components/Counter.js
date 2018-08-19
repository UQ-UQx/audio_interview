import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { increaseCount, decreaseCount, resetCount } from '../actions';

const CounterComponentContainer = styled.div`
    margin-top: 20px;
`;

const CountContainer = styled.div`
    margin: 10px;
    font-size: 25px;
    color: ${props => (props.isNegative ? 'red' : 'blue')};
`;

/* 

    The following components have been implimented as stateless/pure components, 
    as an example, please read about the differences and decide whether it is appropriate in
    your use case. 
    https://stackoverflow.com/questions/40703675/react-functional-stateless-component-purecomponent-component-what-are-the-dif

*/
const IncreaseCountButton = ({ increaseCount }) => {
    const increaseVal = 6;
    return (
        <button
            type="button"
            onClick={() => {
                increaseCount(increaseVal);
            }}
        >
            Increase by {increaseVal}
        </button>
    );
};

const DecreaseCountButton = ({ decreaseCount }) => {
    const decreaseVal = 3;
    return (
        <button
            type="button"
            onClick={() => {
                decreaseCount(decreaseVal);
            }}
        >
            Decrease by {decreaseVal}
        </button>
    );
};

const ResetCountButton = ({ resetCount }) => (
    <button
        type="button"
        onClick={() => {
            resetCount();
        }}
    >
        Reset Count
    </button>
);

const CounterComponent = props => {
    const { count, increaseCount, decreaseCount, resetCount } = props;
    return (
        <CounterComponentContainer>
            <IncreaseCountButton increaseCount={increaseCount} />
            <DecreaseCountButton decreaseCount={decreaseCount} />
            <ResetCountButton resetCount={resetCount} />
            <CountContainer isNegative={count < 0}>{count}</CountContainer>
        </CounterComponentContainer>
    );
};

export default connect(
    state => ({
        count: state.count,
    }),
    { increaseCount, decreaseCount, resetCount }
)(CounterComponent);

CounterComponent.propTypes = {
    count: PropTypes.number.isRequired,
    increaseCount: PropTypes.func.isRequired,
    decreaseCount: PropTypes.func.isRequired,
    resetCount: PropTypes.func.isRequired,
};
IncreaseCountButton.propTypes = {
    increaseCount: PropTypes.func.isRequired,
};
DecreaseCountButton.propTypes = {
    decreaseCount: PropTypes.func.isRequired,
};
ResetCountButton.propTypes = {
    resetCount: PropTypes.func.isRequired,
};
