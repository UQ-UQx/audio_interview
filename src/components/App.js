import React from 'react';
import styled from 'styled-components';
// import axios from 'axios';
import { withRouter } from 'react-router-dom';

import { Row, Col } from 'reactstrap';
// import ApiTestButtons from './ApiTestButtons';

import Webcam from './Webcam';

const AppContainer = styled.div``;

const MediaVisualsContainer = styled.div``;

const SCol = styled(Col)`
    padding: 0 !important;
`;

const WebcamContainer = styled.div`
    background-color: red;
`;

const AudioContainer = styled.div`
    background-color: blue;
`;

const App = () => (
    <AppContainer>
        <MediaVisualsContainer>
            <Row>
                <SCol xs="5">
                    <WebcamContainer>
                        <Webcam />
                    </WebcamContainer>
                </SCol>
                <SCol xs="7">
                    <AudioContainer>Audio container</AudioContainer>
                </SCol>
            </Row>
        </MediaVisualsContainer>
    </AppContainer>
);

export default withRouter(App);
