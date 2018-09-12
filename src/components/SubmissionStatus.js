import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import transition from 'styled-transition-group';

import { Line } from 'rc-progress';

const Fade = transition.div`
    &:enter { opacity: 0.01; }
    &:enter-active {
      opacity: 1;
      transition: opacity 1000ms ease-in;
    }
    &:exit { opacity: 1; }
    &:exit-active {
      opacity: 0.01;
      transition: opacity 0ms ease-in;
    }
  `;

const SubmissionStatusContainer = styled.div`
    opacity: 1 !important;
    color: white;
    margin-top: 20px;
    text-align: center;
`;

const SubmittedMessage = styled.div`
    background-color: #00d426;
    ${'' /* color: #006913; */} padding: 10px;

    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    border-radius: 20px;
    margin: 50px;
    padding-top: 25px;
    text-align: center;

    font-weight: bold;
    font-size: 17px;
`;

const SubmittingMessage = styled.div`
    background-color: #ff8d00;
    color: #824800;
    padding: 10px;

    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    border-radius: 20px;
    margin: 50px;
    padding-top: 15px;

    font-weight: bold;
    font-size: 17px;
`;

const TimeRemainingContainer = styled.div`
    background-color: #0ed6ff;
    color: #043e4a;
    padding: 10px;

    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    border-radius: 20px;

    -webkit-border-top-radius: 0;
    -moz-border-top-radius: 0;
    border-top-radius: 0;
`;
const UploadSpeed = styled.div``;

const SubmissionStatus = props => {
    const { percentCompleted, speed, timeRemaining } = props;
    return (
        <React.Fragment>
            <Fade
                unmountOnExit
                in={percentCompleted > 0 && percentCompleted < 100}
                timeout={1000}
            >
                <SubmissionStatusContainer>
                    {percentCompleted > 0 && percentCompleted < 100 ? (
                        <div>
                            <SubmittingMessage>
                                Your Interview is now being uploaded ...{' '}
                                <FontAwesomeIcon icon="spinner" pulse />
                                <p>
                                    Please DO NOT close this window until the
                                    upload has been completed
                                </p>
                            </SubmittingMessage>
                            <Line
                                percent={percentCompleted}
                                strokeWidth="2"
                                strokeColor="#06AFD4"
                            />
                            <TimeRemainingContainer>
                                Estimated Time Reaining:{' '}
                                {moment
                                    .duration(timeRemaining, 'seconds')
                                    .format('hh:mm:ss', {
                                        trim: false,
                                    })}
                                <UploadSpeed>
                                    Upload Speed:
                                    {` ${speed} Kb/s`}
                                </UploadSpeed>
                            </TimeRemainingContainer>
                        </div>
                    ) : (
                        ''
                    )}
                </SubmissionStatusContainer>
            </Fade>
            <Fade unmountOnExit in={percentCompleted === 100} timeout={1000}>
                <SubmittedMessage>
                    <p>
                        <span role="img" aria-label="party popper emoji">
                            🎉
                        </span>{' '}
                        Your Interview has been submitted
                        {'  '}
                        <span role="img" aria-label="party popper emoji">
                            🎉
                        </span>
                    </p>
                </SubmittedMessage>
            </Fade>
        </React.Fragment>
    );
};

SubmissionStatus.propTypes = {
    percentCompleted: PropTypes.number,
    speed: PropTypes.number,
    timeRemaining: PropTypes.number,
};

SubmissionStatus.defaultProps = {
    percentCompleted: 0,
    speed: 0,
    timeRemaining: 0,
};
export default SubmissionStatus;

// <h4>
//     {timeRemaining > 0 ? (
//         <div>
//             <TimeRemainingContainer>
//                 {moment
//                     .duration(timeRemaining, 'seconds')
//                     .format('hh:mm:ss', {
//                         trim: false,
//                     })}
//             </TimeRemainingContainer>
//             <Line
//                 percent={percentCompleted}
//                 strokeWidth="2"
//                 strokeColor="#06AFD4"
//             />
//         </div>
//     ) : (
//         ''
//     )}
// </h4>

// <p>{percentCompleted}</p>
// <p>{speed}</p>
// <p>{timeRemaining}</p>
