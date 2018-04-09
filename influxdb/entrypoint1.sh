#!/bin/sh

bash /entrypoint.sh 
influxd &

echo "Waiting InfluxDB to start"

curl localhost:8086/ping
while [ $? -ne 0 ]; do
  echo -n "."
  sleep 2
  curl localhost:8086/ping
done
echo " "

curl -i -XPOST http://localhost:8086/query --data-urlencode "q=CREATE DATABASE jmeter"

wait $!