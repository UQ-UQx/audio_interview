import React from 'react';
import styled from 'styled-components';
// import axios from 'axios';
import { withRouter } from 'react-router-dom';

// import { Row, Col } from 'reactstrap';
// import ApiTestButtons from './ApiTestButtons';

import InterviewCam from './InterviewCam';

const AppContainer = styled.div``;

const MediaVisualsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const WebcamContainer = styled.div`
    background-color: black;
`;

const AudioContainer = styled.div`
    background-color: blue;
    min-width: 300px;
    flex: 1 auto;
`;

const App = () => (
    <AppContainer>
        <MediaVisualsContainer>
            <WebcamContainer>
                <InterviewCam />
            </WebcamContainer>

            <AudioContainer>Audio container</AudioContainer>
        </MediaVisualsContainer>
    </AppContainer>
);

export default withRouter(App);
