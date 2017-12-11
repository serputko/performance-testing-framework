#!/bin/bash
bash -x ./bin/jmeter.sh -n -t ${SCENARIO} -l ${WORKSPACE}/report.log -e -o ${WORKSPACE}/report/ -JUSERS=${USERS} -JPAMPUP=${RAMPUP} -JHOLDLOAD=${HOLDLOAD} -JSHUTDOWN=${SHUTDOWN}