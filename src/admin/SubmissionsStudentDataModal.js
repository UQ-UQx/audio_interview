import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import Dropzone from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { uploadStudentDataFiles } from '../actions';

import datadownloadpng from '../assets/modal.png';

const Datadownloadimg = styled.img`
    width: 70%;
    margin-bottom: 20px;
    border: 2px solid green;
`;

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

class SubmissionsStudentDataUpload extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFiles: [],
            error: '',
        };

        this.uploadFiles = this.uploadFiles.bind(this);
    }

    uploadFiles() {
        const { selectedFiles } = this.state;
        const {
            // toggleModal,
            uploadStudentDataFilesAction,
        } = this.props;

        console.log('uploading', selectedFiles);

        const studentProfileFiles = selectedFiles.filter(file =>
            /student_profile/.test(file.name)
        );

        const anonIDsFiles = selectedFiles.filter(file =>
            /anon-ids/.test(file.name)
        );

        if (studentProfileFiles.length > 0 && anonIDsFiles.length > 0) {
            uploadStudentDataFilesAction({
                profile: studentProfileFiles[0],
                anon: anonIDsFiles[0],
            }).then(response => {
                console.log(response);
            });
        } else {
            this.setState({
                error: 'Please upload BOTH student profile and anon IDs files',
            });
        }

        // toggleModal();
    }

    render() {
        const { toggleModal } = this.props;
        const { selectedFiles, error } = this.state;

        const dropzoneContent = (
            <DropzoneContentContainer>
                <DropzoneContent>
                    <DropzoneContentItem>
                        Drag and Drop your CSV files here
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
                <ModalHeader toggle={toggleModal}>
                    Upload Student Data
                </ModalHeader>
                <ModalBody>
                    <p>
                        In order for the submissions to match a leaner, you will
                        need to export the <b>student profile</b> and{' '}
                        <b>anonymized IDs</b> CSV Files and upload them here
                    </p>
                    <Datadownloadimg
                        src={datadownloadpng}
                        alt="shows where to download the files"
                    />
                    <FileDropZone
                        accept="text/csv"
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
                        <UploadIcon icon="cloud-upload-alt" />
                        {'  '}
                        Upload
                    </Button>{' '}
                    <Button color="secondary" onClick={toggleModal}>
                        Cancel
                    </Button>
                </ModalFooter>
            </div>
        );
    }
}

SubmissionsStudentDataUpload.propTypes = {
    toggleModal: PropTypes.func.isRequired,
    uploadStudentDataFilesAction: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        submissions: state.submissions,
    }),
    {
        uploadStudentDataFilesAction: uploadStudentDataFiles,
    }
)(SubmissionsStudentDataUpload);
