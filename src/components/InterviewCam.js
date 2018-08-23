import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Webcam from 'react-webcam';
import { connect } from 'react-redux';
import { getScreenshot } from '../actions';

const Container = styled.div`
    height: ${props => (props.Height ? props.Height : 400)}px;
    width: 100%;
    background-color: black;
`;

class InterviewCam extends Component {
    constructor(props) {
        super(props);

        this.state = {
            interval: null,
        };
        this.screenshotInterval = this.screenshotInterval.bind(this);
    }

    componentWillMount() {
        const { interval } = this.state;
        clearInterval(interval);
    }

    componentDidMount() {
        const { screenshotStreamInterval } = this.props;
        const interval = setInterval(
            this.screenshotInterval,
            screenshotStreamInterval
        );
        this.setState({ interval });
    }

    screenshotInterval() {
        const { record, getScreenshot } = this.props;
        if (record) getScreenshot(this.webcam.getScreenshot());
    }

    render() {
        const { Height } = this.props;
        const videoConstraints = {
            // width: 1280,
            // height: 720,
            facingMode: 'user',
        };

        return (
            <Container Height={Height}>
                <Webcam
                    height={Height}
                    audio={false}
                    ref={webcam => {
                        this.webcam = webcam;
                    }}
                    screenshotFormat="image/jpeg"
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
    record: PropTypes.bool.isRequired,
    Height: PropTypes.number,
};

InterviewCam.defaultProps = {
    screenshotStreamInterval: 10000,
    Height: 400,
};

export default connect(
    state => ({
        record: state.record,
    }),
    { getScreenshot }
)(InterviewCam);
