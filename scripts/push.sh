#!/bin/bash
# Push with increased buffer to avoid HTTP 408 timeout on large files
git -c http.postBuffer=524288000 push "$@"
