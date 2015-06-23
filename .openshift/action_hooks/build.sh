#!/bin/bash
OLD_HOME=$HOME
export HOME=$OPENSHIFT_REPO_DIR
if [ -f "${OPENSHIFT_REPO_DIR}"/gulpfile.js ]; then
 (cd "${OPENSHIFT_REPO_DIR}"; node_modules/.bin/gulp)
fi
export HOME=$OLD_HOME