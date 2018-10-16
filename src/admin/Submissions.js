import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button, Modal } from 'reactstrap';
import SubmissionsStudentDataModal from './SubmissionsStudentDataModal';
import { getSubmissions } from '../actions';

const UploadDataButton = styled(Button)``;

const FileUploadModal = styled(Modal)`
    width: 80%;
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
        getSubmissionsList().then(response => {
            console.log(response.payload.data);
        });
    }

    toggleModal() {
        const { uploadmodal } = this.state;

        this.setState({
            uploadmodal: !uploadmodal,
        });
    }

    render() {
        console.log('wow');

        const { submissions } = this.props;
        const { uploadmodal } = this.state;

        return (
            <div>
                <UploadDataButton
                    onClick={() => {
                        this.setState({
                            uploadmodal: true,
                        });
                    }}
                >
                    Import Student Data
                </UploadDataButton>
                <FileUploadModal
                    size="lg"
                    isOpen={uploadmodal}
                    toggle={this.toggleModal}
                >
                    <SubmissionsStudentDataModal
                        toggleModal={this.toggleModal}
                    />
                </FileUploadModal>
                <pre>{JSON.stringify(submissions, null, 2)}</pre>
            </div>
        );
    }
}

Submissions.propTypes = {
    getSubmissionsList: PropTypes.func.isRequired,
    submissions: PropTypes.shape({}),
};

Submissions.defaultProps = {
    submissions: {},
};

export default connect(
    state => ({
        submissions: state.submissions,
    }),

    { getSubmissionsList: getSubmissions }
)(Submissions);
