import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Webcam from 'react-webcam';
import { connect } from 'react-redux';
import moment from 'moment';
import { getScreenshot } from '../actions';

const Container = styled.div`
    height: ${props => (props.height ? props.height : 0)}px;
    width: 100%;
    background-color: black;
`;

class InterviewCam extends Component {
    constructor(props) {
        super(props);

        this.state = {
            interval: null,
            startTime: null,
        };
        this.screenshotInterval = this.screenshotInterval.bind(this);
    }

    componentWillMount() {
        const { interval } = this.state;
        clearInterval(interval);
    }

    componentDidMount() {
        this.ismounted = false;

        const { screenshotStreamInterval } = this.props;
        const interval = setInterval(
            this.screenshotInterval,
            screenshotStreamInterval
        );
        this.setState({ interval });
    }

    componentWillUnmount() {
        this.ismounted = false;
    }

    screenshotInterval() {
        const { startTime } = this.state;
        const { record, getScreenshot, onScreenshot } = this.props;
        if (record && this.webcam) {
            if (startTime === null) this.setState({ startTime: moment() });
            const screenshot = this.webcam.getScreenshot();

            const secondsElapsed = moment().diff(startTime, 'seconds', true);

            const screenshotObj = {
                data: screenshot,
                timestamp: secondsElapsed,
            };

            onScreenshot(screenshotObj);
            getScreenshot(screenshotObj);
        } else if (this.ismounted) this.setState({ startTime: null });
    }

    render() {
        const { height } = this.props;
        const videoConstraints = {
            width: 1280,
            height: 720,
            facingMode: 'user',
        };

        return (
            <Container height={height}>
                <Webcam
                    width="100%"
                    height={height}
                    audio={false}
                    ref={webcam => {
                        this.webcam = webcam;
                    }}
                    screenshotFormat="image/png"
                    videoConstraints={videoConstraints}
                />
            </Container>
        );
    }
}

InterviewCam.propTypes = {
    /**
     * Interval in milliseconds
     *
     */
    screenshotStreamInterval: PropTypes.number,
    getScreenshot: PropTypes.func.isRequired,
    onScreenshot: PropTypes.func,
    record: PropTypes.bool.isRequired,
    height: PropTypes.number,
};

InterviewCam.defaultProps = {
    screenshotStreamInterval: 10000,
    height: 400,
    onScreenshot: () => {},
};

export default connect(
    state => ({
        record: state.record,
    }),
    { getScreenshot }
)(InterviewCam);
