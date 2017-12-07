#!/bin/sh
bash -x /usr/local/bin/jenkins.sh &

echo "Waiting Jenkins to start"

java -jar /var/jenkins_home/war/WEB-INF/jenkins-cli.jar -s http://admin:admin@localhost:8080/ version
while [ $? -ne 0 ]; do
  echo -n "."
  sleep 2
  java -jar /var/jenkins_home/war/WEB-INF/jenkins-cli.jar -s http://admin:admin@localhost:8080/ version
done
echo " "

echo "Trying to import jobs to jenkins"

for job in `ls -1 /jobs/*.xml`; do
  java -jar /var/jenkins_home/war/WEB-INF/jenkins-cli.jar -s http://admin:admin@localhost:8080/ create-job $(basename ${job} .xml) < ${job}
  if [ $? -eq 0 ]; then
    echo "Job ${job} successfuly added"
  elif [ $? -eq 4 ]; then
    echo "Job ${job} already exists in Jenkins"
  fi
done

wait $!

