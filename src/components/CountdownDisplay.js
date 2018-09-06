import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { adjustHue } from 'polished';

const Display = styled.div`
    font-size: 20px;
    color: white;
    background-color: ${props =>
        props.time && props.changeHue
            ? adjustHue(90 * (props.time / props.startTime), '#FF530D')
            : 'black'};
    color: ${props =>
        props.time && props.changeHue
            ? adjustHue(90 * (props.time / props.startTime), '#471704')
            : 'white'};
`;

const CountdownDisplay = props => {
    const { time, startTime, changeHue } = props;
    return (
        <Display changeHue={changeHue} time={time} startTime={startTime}>
            {time}
        </Display>
    );
};

CountdownDisplay.propTypes = {
    time: PropTypes.number.isRequired,
    startTime: PropTypes.number,
    changeHue: PropTypes.bool,
};

CountdownDisplay.defaultProps = {
    startTime: 1,
    changeHue: false,
};

export default CountdownDisplay;
