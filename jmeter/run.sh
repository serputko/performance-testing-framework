#!/bin/bash

# Define the file name
filename="scenarios/sergii_input.csv"

# Write the header to the file
echo "username,firstName,lastName,email,password,phone,userStatus" > $filename

# Get the number of records to create from the first script argument
num_records=${1:-4}

# Use a for loop to create the specified number of records
for (( i=1; i<=$num_records; i++ ))
do
  # Write the data to the file
  echo "username$i,Egor$i,Doe$i,username$i@gmail.com,password$i,+38067456890$i,$((i%2))" >> $filename
done

# Replace the LoopController.loops value in the SergiiScenario.jmx file
sed -i "s/<stringProp name=\"LoopController.loops\">[0-9]*<\/stringProp>/<stringProp name=\"LoopController.loops\">$num_records<\/stringProp>/g" scenarios/SergiiScenario.jmx

docker build -t sergii_jmeteri .
docker rm -f sergii_jmeter || true
docker run -v $(pwd)/scenarios:/jmeter/scenarios -v $(pwd)/results:/jmeter/results --entrypoint "" --name sergii_jmeter sergii_jmeteri java -jar '/opt/apache-jmeter-5.5/bin/ApacheJMeter.jar' -n -f -t '/jmeter/scenarios/SergiiScenario.jmx' -l '/jmeter/results/sergiiResults.jtl' -e -o '/jmeter/results/report'
