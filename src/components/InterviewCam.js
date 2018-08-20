import React from 'react';
import styled from 'styled-components';
import Webcam from 'react-webcam';

const Container = styled.div``;
const SWebcam = styled(Webcam)`
    text-align: right;
`;

let webcam = null;

const setRef = cam => {
    console.log(webcam);
    webcam = cam;
};

const InterviewCam = () => {
    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: 'user',
    };

    return (
        <Container>
            <SWebcam
                audio={false}
                ref={setRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
            />
        </Container>
    );
};

export default InterviewCam;
