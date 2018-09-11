import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';

import ReactPlayer from 'react-player';

import { Button } from 'reactstrap';

const PreviewContainer = styled.div``;

class Preview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            playing: false,
        };
    }

    render() {
        const { audioFilename, videoFilename } = this.props;
        const { playing } = this.state;
        console.log(audioFilename, videoFilename);
        return (
            <PreviewContainer>
                <ReactPlayer
                    ref={el => {
                        console.log('videoPlayer', el);
                        this.videoPlayer = el;
                    }}
                    playing={playing}
                    url={`./media/recordings/${$LTI.userID}/${videoFilename}`}
                />

                <ReactPlayer
                    ref={el => {
                        console.log('audioPlayer', el);
                        this.audioPlayer = el;
                    }}
                    playing={playing}
                    url={`./media/recordings/${$LTI.userID}/${audioFilename}`}
                    height={0}
                />

                <Button
                    onClick={() => {
                        this.setState({
                            playing: true,
                        });
                    }}
                >
                    Play
                </Button>
                <Button
                    onClick={() => {
                        this.setState({
                            playing: true,
                        });
                    }}
                >
                    Stop
                </Button>
            </PreviewContainer>
        );
    }
}

Preview.propTypes = {
    audioFilename: PropTypes.string.isRequired,
    videoFilename: PropTypes.string.isRequired,
};

Preview.defaultProps = {};

export default Preview;
