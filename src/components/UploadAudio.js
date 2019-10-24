import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { connect } from 'react-redux';

import { ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dropzone from 'react-dropzone';

const FileDropZone = styled(Dropzone)`
    width: 100%;
    /* height: 300px; */
    border: 2px dashed black;
`;

const DropzoneContentContainer = styled.div`
    padding: 50px;
    width: 100%;
    /* position: relative;
    height: 150px; */
`;

const DropzoneContent = styled.div`
    /* height: 0px; */
    /* position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    width: 80%; */
    text-align: center;
`;

const DropzoneContentItem = styled.div`
    padding: 5px;
    text-align: center;
    font-weight: bold;
`;

const SelectedFiles = styled(DropzoneContentItem)`
    margin-top: 20px;
    font-size: 15px;
    font-weight: normal;
`;

const DropzoneButton = styled(Button)``;

const DropZoneItemRemoveButton = styled.a`
    &:hover {
        cursor: pointer;
    }
`;

const UploadIcon = styled(FontAwesomeIcon)`
    margin-bottom: 5px;
    margin-right: 5px;
`;

class UploadAudio extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFiles: [],
            error: '',
            uploading: false,
        };
    }

    render() {
        const { toggleModal } = this.props;
        const { selectedFiles, error, uploading } = this.state;

        console.log('UploadAudio', this.state, this.props);

        const dropzoneContent = (
            <DropzoneContentContainer>
                <DropzoneContent>
                    <DropzoneContentItem>
                        Drag and Drop your Audio files here
                    </DropzoneContentItem>
                    OR
                    <DropzoneContentItem>
                        <DropzoneButton
                            color="info"
                            onClick={() => {
                                this.file_dropzone.open();
                            }}
                        >
                            Browse
                        </DropzoneButton>
                    </DropzoneContentItem>
                    <SelectedFiles>
                        {selectedFiles.length > 0 ? (
                            <div>
                                <h5>
                                    Selected File
                                    {selectedFiles.length > 1 ? 's' : ''}
                                </h5>{' '}
                                {selectedFiles.map(file => (
                                    <div key={file.name}>
                                        <DropZoneItemRemoveButton
                                            onClick={() => {
                                                console.log('REMOVE');
                                                this.setState({
                                                    selectedFiles: selectedFiles.filter(
                                                        fileToFiler =>
                                                            fileToFiler.name !==
                                                            file.name
                                                    ),
                                                });
                                            }}
                                        >
                                            {file.name}{' '}
                                            <FontAwesomeIcon
                                                color="red"
                                                size="1x"
                                                icon="times-circle"
                                            />
                                        </DropZoneItemRemoveButton>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            ''
                        )}
                    </SelectedFiles>
                </DropzoneContent>
            </DropzoneContentContainer>
        );

        return (
            <div>
                <ModalHeader>Upload Your Audio</ModalHeader>
                <ModalBody>
                    <FileDropZone
                        accept="audio/*"
                        onDrop={(accepted, rejected) => {
                            console.log(accepted, rejected);
                            this.setState({
                                selectedFiles: [...accepted],
                            });
                        }}
                        disableClick
                        className="video-dropzone"
                        multiple
                        innerRef={dropz => {
                            this.file_dropzone = dropz;
                        }}
                        maxSize={1258291200}
                    >
                        {dropzoneContent}
                    </FileDropZone>
                </ModalBody>
                <ModalFooter>
                    {error !== '' ? error : ''}
                    <Button color="primary" onClick={this.uploadFiles}>
                        {uploading ? (
                            <React.Fragment>
                                <UploadIcon icon="spinner" pulse />
                                {'  '}
                                Uploading
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <UploadIcon icon="cloud-upload-alt" />
                                {'  '}
                                Upload
                            </React.Fragment>
                        )}
                    </Button>{' '}
                    <Button color="secondary" onClick={toggleModal}>
                        Cancel
                    </Button>
                </ModalFooter>
            </div>
        );
    }
}

UploadAudio.propTypes = {
    toggleModal: PropTypes.func.isRequired,
    //    uploadStudentDataFilesAction: PropTypes.func.isRequired,
};

export default connect(
    () => ({}),
    {}
)(UploadAudio);
