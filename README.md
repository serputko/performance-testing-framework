<!--- 
Copyright © 2017-2018 Anton Serputko. Contacts: serputko.a@gmail.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Performance testing framework

This framework could be used both for backend load testing with Apache Jmeter and frontend load test with sitespeed.io + webpagetest private instance.

### Custom Grafana dashboards features:
* **view** application/server-side metrics in real time while test is running
* **analyze** errors cause with detailed traces for failed requests
* **compare** different test runs in scripted dashboard

#### Dashboard demo
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/grafana_dashboard_demo.gif)

#### Tests comparison
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/grafana_compare_tests_demo.png)



## Getting Started

Framework consists of next services:
- **Grafana**: data visualization & monitoring
- **Influxdb**: time series DB platform for metrics & events(Time Series Data)
- **Telegraf**: server agent for collecting & reporting metrics
- **Sitespeed.io**: set of tools for frontend load testing
- **Graphite**: time series DB platform for metrics
- **Jenkins**: continuous integration server for tests execution
- **Portainer**: service for managing docker environment
- **Webpagetest**: private instance of webpagetest server for frontend tests execution
- **Apache Jmeter**: tool for backend load testing

## Framework architecture:
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/Framework%20structure.png)
	
## Prerequisites

To run framework install docker: https://docs.docker.com/engine/installation/.

You should be able to run ```docker run hello-world``` with no errors.

**For Windows**:
- share C:\ D:\ drives with docker: https://blogs.msdn.microsoft.com/stevelasker/2016/06/14/configuring-docker-for-windows-volumes/
- starting from 18.0.3 docker version you need to set up windows user variable to handle linux VM path in docker-compose:
start cmd as administrator and execute ```setx COMPOSE_CONVERT_WINDOWS_PATHS "1" /M``` or simply install older version of docker https://download.docker.com/win/stable/15139/Docker%20for%20Windows%20Installer.exe

## Installing

1. Clone this repository
```git clone https://github.com/serputko/performance-testing-framework.git``` 
2. open performance-testing-framework dir

**For Backend testing:**

3. (optional) if you want to update existing services
```
docker-compose pull
docker-compose build 
docker-compose down
```
4. ```docker-compose up -d```

**For Frontend + Backend testing**

3. (optional) if you want to update existing services
```
docker-compose -f docker-compose-with-frontend.yml pull
docker-compose -f docker-compose-with-frontend.yml build
docker-compose -f docker-compose-with-frontend.yml down
```
4. ```docker-compose -f docker-compose-with-frontend.yml up -d```

All containers should be up and running

### Services endpoints
- **jenkins** localhost:8181
- **grafana** localhost:8857
- **portainer** localhost:9000
- **webpagetest server** localhost:80
- **influxdb** localhost:8653

## Jenkins

Login to Jenkins with admin/admin(could be changed in docker-compose file)
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_dashboard.png)
By default jenkins consists of 2 jobs:
- **BackendJob**: run Jmeter scenarios
- **FrontendJob**: run tests with sitespeed.io and webpagetest private instance

## Running demo jmeter scenario with BackendJob

![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_backendjob_start_test.gif)

To run jmeter demo script: **Open BackendJob -> Build with Parameters -> Set build parameters -> Select scenario -> Build**

This job will start jmeter docker container and execute demo_scenario.jmx jmeter scenario
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jmeter_demo_scenario.png)

To open demo_scenario in local instance of Jmeter please install Plugin Manager https://jmeter-plugins.org/wiki/PluginsManager/. It will automatically install all required plugins.

## Making your jmeter script compatible with framework

Create jmeter test scenario 

Modify your jmeter scenario to work with framework, add:
- **JSR223 Listener from demo scenario**
	Contains groovy script that:
    * Generates detailed trace about request/response info for failed samplers
    * Posts generated trace to jmeter log(could be viewed in jenkins job)
    * Set trace to sampler response message. 
    If failed samplers are part of Transaction Controller(generate parent sample enabled) all traces will be set to Transaction Controller response message
- **Backend Listener from demo scenario**
	Sends samplers data to influxdb database. Fields:
    * **application** - groovy script set field value in next format: 
    ```
    .jmx file title @ jenkins build number @ test start time (f.e. demo_scenario.jmx @ 18 @ Sat Jul 28 09:44:26 UTC 2018)
    ```
    * **testTitle** - groovy script generates parameterized title like:
    ```
    Jenkins build #18 http://127.0.0.1:8181/job/BackendJob/18/ with demo_scenario.jmx scenario with 10 users, 180 sec rampup and 600 sec duration was started
    ```
    
    * **eventTags** - info from testTitle field in tag format

    Data from these fields will be displayed in grafana dashboard annotations- Green/Red vertical lines that stands for test Start/End.
    ![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/grafana_annotations_demo.gif)
- (optional) **jp@gc - Console Status Logger**
	sends minimalistic stats to jenkins console output about test execution:
    ```
    #43	Threads: 3/10	Samples: 16	Latency: 23	Resp.Time: 197	Errors: 2
    #44	Threads: 3/10	Samples: 16	Latency: 32	Resp.Time: 203	Errors: 1
    ```

## Grafana

Start demo_scenario.jmx test with jenkins Backend job

Real time results should be available in grafana
Open 'Load test monitoring' dashboard. Dashboard contains visualizations based on data from influxdb.

### Available metrics

Dashboard has multiple rows with different metrics
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/grafana_dashboard_available_stats.png)

### Timerange
All values in visualizations are calculated according to selected time range. Default timerange is last 15 min with 10 sec refresh. Timerange could be set in timepicker or selected on any graph.
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/grafana_set_time_range.gif)

### Templating
Graphs and series on dashboard are displayed dynamically according to variables selected 
* **group_time** - aggregation time 
* **metric** - which series to show on Response Times Over Time graph(default All)
* **scenario** - results of which scenario to display
* **transactions** - which transactions to show on Response Times Over Time row(default All). transaction variable depends on scenario variable
* **server_measurements** - which server side metrics to show
* **host** - for which servers show monitoring


### Failed requests details
If JSR223 listener was added to scenario than detailed traces for failed requests can be viewed in 'Error details' table. 
Example of failed request: 
```
Number of samples in transaction : 1, number of failing samples : 1
Login; Response message: Unauthorized;
Status code: 401;
Number of failed assertions: 1

Sample Failed: Login
Started at: Mon Jul 30 11:54:59 UTC 2018
Finished at: Mon Jul 30 11:54:59 UTC 2018
Request:
{
    "code": "1234567"
}
REQUEST DATA
URL: http://demo-server.com/login
Request headers:
Content-Type: application/json

Response: 
Unauthorized
Response code:401

Response data:
{
   "Error message": "Incorrect password or confirmation code entered. Please try again."
}

Assertion results:
Number of failed assertions: 1
Response Assertion Failed; 
Failure Message: Test failed: text expected to contain /success/;
```

### Test runs comparison
Tests comparison is done using scripted js dashboard. It could be accessed at http://127.0.0.1:8857/dashboard/script/compare_tests.js

![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/grafana_compare_tests_demo.gif)


## FrontendJob
To run frontend test: **Open FrontendJob -> Build with Parameters -> Set build parameters -> Build**
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_frontendjob_run.png)

This job will start sitespeed.io docker container and run test with parameters using WebPageTest private instance 

Frontend test deliverables:
- **sitespeed.io HTML report**
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_frontendjob_sitespeed_html_report.png)
- **webpagetest HTML report**
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_frontendjob_webpagetest_html_report.png)
