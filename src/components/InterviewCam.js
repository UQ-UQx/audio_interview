import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Webcam from 'react-webcam';

const Container = styled.div``;

class InterviewCam extends Component {
    constructor(props) {
        super(props);

        this.captureImage = this.captureImage.bind(this);
    }

    captureImage() {
        const { getImage } = this.props;
        return getImage(this.webcam.getScreenshot());
    }

    render() {
        const videoConstraints = {
            width: 1280,
            height: 720,
            facingMode: 'user',
        };

        return (
            <Container>
                <Webcam
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
    getImage: PropTypes.func,
};

InterviewCam.defaultProps = {
    getImage: () => {},
};

export default InterviewCam;
