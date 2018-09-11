import React from 'react';
import PropTypes from 'prop-types';

const Submissions = props => {
    const { componentName } = props;
    return <div>{componentName}</div>;
};

Submissions.propTypes = {
    componentName: PropTypes.string,
};
Submissions.defaultProps = {
    componentName: 'Submissions',
};

export default Submissions;
