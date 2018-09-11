import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Webcam from 'react-webcam';
import { connect } from 'react-redux';
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
        };
        this.screenshotInterval = this.screenshotInterval.bind(this);
        this.onMedia = this.onMedia.bind(this);
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

    onMedia(media) {
        const { height } = this.props;
        console.log('WOOOO', media, height);
    }

    screenshotInterval() {
        const { record, getScreenshot, onScreenshot } = this.props;
        if (record && this.webcam) {
            const screenshot = this.webcam.getScreenshot();
            onScreenshot(screenshot);
            getScreenshot(screenshot);
        }
    }

    render() {
        const { height } = this.props;
        const videoConstraints = {
            // width: 1280,
            // height: 720,
            facingMode: 'user',
        };

        return (
            <Container height={height}>
                <Webcam
                    height={height}
                    audio={false}
                    ref={webcam => {
                        this.webcam = webcam;
                    }}
                    screenshotFormat="image/webp"
                    videoConstraints={videoConstraints}
                    onUserMedia={this.onMedia}
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
