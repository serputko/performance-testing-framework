#!/bin/bash
bash ./bin/jmeter.sh -n -t ${SCENARIO} -j ${WORKSPACE}/jmeter.log -l ${WORKSPACE}/report.log -e -o ${WORKSPACE}/report/ -JUSERS=${USERS} -JRAMPUP=${RAMPUP} -JDURATION=${DURATION}