import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { adjustHue } from 'polished';

import CircularProgressbar from 'react-circular-progressbar';

import 'react-circular-progressbar/dist/styles.css';

const Display = styled.div`
    width: 200px;
    margin: 0 auto;
    font-size: 20px;
`;

const displayByMinute = secondValue => {
    const minute = Math.floor(secondValue / 60);
    const second = secondValue % 60;

    if (minute === 0) return `${second}"`;
    return `${minute}'${second}"`;
};

const CountdownDisplay = props => {
    const { time, startTime, changeHue, display } = props;
    const timeRemainingPercentage = (time / startTime) * 100;

    console.log('CountdownDisplay', time, startTime, changeHue, display);
    const newDisplay = displayByMinute(time);
    console.log('newDisplay', newDisplay);
    return (
        <Display changeHue={changeHue} time={time} startTime={startTime}>
            <CircularProgressbar
                percentage={timeRemainingPercentage}
                text={newDisplay}
                styles={{
                    path: {
                        stroke: changeHue
                            ? adjustHue(
                                  90 * (timeRemainingPercentage / 100),
                                  '#FF530D'
                              )
                            : 'black',
                    },
                    text: {
                        fill: changeHue
                            ? adjustHue(
                                  90 * (timeRemainingPercentage / 100),
                                  '#FF530D'
                              )
                            : 'black',
                        fontSize: '16px',
                    },
                }}
            />
        </Display>
    );
};

CountdownDisplay.propTypes = {
    time: PropTypes.number.isRequired,
    startTime: PropTypes.number,
    changeHue: PropTypes.bool,
    display: PropTypes.string.isRequired,
};

CountdownDisplay.defaultProps = {
    startTime: 1,
    changeHue: false,
};

export default CountdownDisplay;
