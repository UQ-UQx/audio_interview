import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button, Modal, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SubmissionsStudentDataModal from './SubmissionsStudentDataModal';
import SubmissionsTable from './SubmissionsTable';
import { getSubmissions } from '../actions';

const UploadDataButton = styled(Button)``;

const FileUploadModal = styled(Modal)`
    width: 80%;
`;

const Warning = styled(Alert)`
    margin-top: 20px;
`;

const UploadIcon = styled(FontAwesomeIcon)`
    margin-bottom: 5px;
    margin-right: 5px;
`;
class Submissions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            uploadmodal: false,
        };

        this.toggleModal = this.toggleModal.bind(this);
    }

    componentDidMount() {
        const { getSubmissionsList } = this.props;
        getSubmissionsList();
    }

    toggleModal() {
        const { uploadmodal } = this.state;

        this.setState({
            uploadmodal: !uploadmodal,
        });
    }

    render() {
        console.log('wow');

        const { submissions, studentData, submissionsMetaData } = this.props;
        const { uploadmodal } = this.state;

        console.log(submissions, studentData);
        return (
            <div>
                {Object.keys(submissions).length > 0 ? (
                    <React.Fragment>
                        {' '}
                        <FileUploadModal
                            size="lg"
                            isOpen={uploadmodal}
                            toggle={this.toggleModal}
                        >
                            <SubmissionsStudentDataModal
                                toggleModal={this.toggleModal}
                            />
                        </FileUploadModal>
                        <div>
                            {Object.keys(submissions).length > 0 &&
                            Object.keys(studentData).length > 0 ? (
                                <SubmissionsTable
                                    submissions={submissions}
                                    students={studentData}
                                    submissionsMetaData={submissionsMetaData}
                                />
                            ) : (
                                <Warning color="warning">
                                    <p>
                                        {Object.keys(submissions).length}{' '}
                                        learners have submitted their interview
                                    </p>
                                    <p>
                                        <b>
                                            Please upload student data to view
                                            submissions
                                        </b>
                                    </p>
                                    <UploadDataButton
                                        onClick={() => {
                                            this.setState({
                                                uploadmodal: true,
                                            });
                                        }}
                                    >
                                        <UploadIcon icon="cloud-upload-alt" />
                                        Upload Student Data
                                    </UploadDataButton>
                                </Warning>
                            )}
                        </div>
                    </React.Fragment>
                ) : (
                    'No submissions available'
                )}
            </div>
        );
    }
}

Submissions.propTypes = {
    getSubmissionsList: PropTypes.func.isRequired,
    submissions: PropTypes.shape({}),
    studentData: PropTypes.shape({}),
    submissionsMetaData: PropTypes.shape({}),
};

Submissions.defaultProps = {
    submissions: {},
    studentData: {},
    submissionsMetaData: {},
};

export default connect(
    state => ({
        submissions: state.submissions,
        studentData: state.studentData,
        submissionsMetaData: state.submissionsMetaData,
    }),

    { getSubmissionsList: getSubmissions }
)(Submissions);
