#!/bin/sh
bash -x /entrypoint.sh &

core_number=$(cat /proc/cpuinfo | awk '/^cpu cores/{print $4}' | tail -1)
echo "number of cores:  "$core_number
export CORE_NUMBER=$core_number

exec "$@"
