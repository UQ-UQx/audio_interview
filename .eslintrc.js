module.exports = {
    "extends": [
        "airbnb",
        "prettier",
        "prettier/react"
    ],
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "env":{
        "jest": true,
        "browser": true,
    },
    "rules": {
        // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
        "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
        "prettier/prettier": [
            "error",
            {
                "trailingComma":"es5",
                "singleQuote": true,
                "printWidth": 80,
                "tabWidth":4
            }
        ],
        "no-shadow": "off",
        "no-console": "off",
    },
    "plugins": [
        "prettier"
    ],
    "globals": {
        "$LTI_courseID":false,
        "$LTI_resourceID":false,
        "$LTI_userID":false,
        "$LTI_user_roles":false,
        "$LTI_grade_url":false,
        "$LTI_consumer_key":false,
        "$LTI_result_sourcedid":false,
        "$LTI_CALL_DATA":false,
    }
};