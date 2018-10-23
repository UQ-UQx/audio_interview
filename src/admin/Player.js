import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';

import ReactPlayer from 'react-player';

import { ButtonGroup, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PlayerContainer = styled.div`
    width: 100%;
    background-color: white;
    padding: 40px;
`;

const Players = styled.div`
    margin-bottom: 10px;
`;

const Progress = styled.div`
    height: 5px;
    background-color: grey;
    width: 480px;
    display: block;
    margin: 0 auto;
`;
const Bar = styled.div`
    height: 5px;
    width: ${props => (props.progress ? `${props.progress * 100}%` : 0)};
    background-color: #38ff00;
    transition: all 1s;
`;

const ButtonIcon = styled.span`
    margin-right: 10px;
`;
class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            playing: false,
            played: 0,
            seeking: false,
        };

        this.onProgress = this.onProgress.bind(this);
    }

    onProgress(state) {
        console.log('onProgress', state);
        const { seeking } = this.state;
        // const { onPlayerProgress } = this.props;

        // onPlayerProgress(state);

        // We only want to update time slider if we are not currently seeking
        if (!seeking) {
            this.setState(state);
        }
    }

    render() {
        const { audio, images } = this.props;
        const { playing, played } = this.state;

        console.log(playing, played);

        return (
            <PlayerContainer>
                <Button
                    color="primary"
                    onClick={() => {
                        console.log('WOAH', this.html5player.currentTime);
                    }}
                >
                    GET
                </Button>
                <Players>
                    {/* <ReactPlayer
                            ref={el => {
                                if (el) this.videoPlayer = el;
                            }}
                            playing={playing}
                            url={`./media/recordings/${$LTI.id}/${
                                $LTI.userID
                            }/${videoFilename}`}
                            width="100%"
                            onProgress={this.onProgress}
                            onEnded={() => {
                                setTimeout(() => {
                                    this.videoPlayer.seekTo(0);
                                    this.setState({
                                        playing: false,
                                    });
                                }, 1000);
                            }}
                        /> */}
                    <audio
                        controls
                        ref={el => {
                            if (el) this.html5player = el;
                        }}
                    >
                        <track kind="captions" />
                        <source src={audio} type="audio/webm" />
                    </audio>

                    <Progress>
                        <Bar progress={played} />
                    </Progress>
                </Players>

                <ButtonGroup>
                    {playing || played > 0 ? (
                        <React.Fragment>
                            <Button
                                onClick={() => {
                                    this.setState({
                                        playing: !playing,
                                    });
                                }}
                                color={
                                    !playing && played > 0
                                        ? 'warning'
                                        : 'secondary'
                                }
                            >
                                {!playing ? (
                                    <ButtonIcon>
                                        <FontAwesomeIcon icon="play" />
                                    </ButtonIcon>
                                ) : (
                                    <ButtonIcon>
                                        <FontAwesomeIcon icon="pause" />
                                    </ButtonIcon>
                                )}
                                {!playing && played > 0 ? 'Paused' : 'Pause'}
                            </Button>
                            <Button
                                onClick={() => {
                                    this.audioPlayer.seekTo(0);
                                    this.setState({
                                        playing: false,
                                    });
                                }}
                                color="danger"
                            >
                                <ButtonIcon>
                                    <FontAwesomeIcon icon="stop" />
                                </ButtonIcon>
                                Stop
                            </Button>
                        </React.Fragment>
                    ) : (
                        <Button
                            onClick={() => {
                                this.setState({
                                    playing: true,
                                });
                            }}
                        >
                            <ButtonIcon>
                                <FontAwesomeIcon icon="play" />
                            </ButtonIcon>
                            {playing ? 'Playing...' : 'Play'}
                        </Button>
                    )}
                </ButtonGroup>
            </PlayerContainer>
        );
    }
}

Player.propTypes = {
    audio: PropTypes.string.isRequired,
    images: PropTypes.shape({}).isRequired,
    // onPlayerProgress: PropTypes.func,
};

Player.defaultProps = {
    // onPlayerProgress: () => {},
};

export default Player;
