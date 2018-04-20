# Docker based performance testing framework

This framework could be used both for backend load testing with Apache Jmeter and frontend load test with sitespeed.io + webpagetest private instance.
Grafana monitoring allows to view and analyze results in real time

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

1. git clone this repository
2. open performance-testing-framework dir
3. docker-compose up -d
All containers should be up and running

### Services endpoints
- **jenkins** localhost:8181
- **grafana** localhost:8857
- **portainer** localhost:9000
- **webpagetest server** localhost:80
- **influxdb** localhost:8653

## Running the tests(demo)

Login to Jenkins with admin/admin(could be changed in docker-compose file)
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_dashboard.png)
By default jenkins consists of 2 jobs:
- **BackendJob**: run Jmeter scenarios
- **FrontendJob**: run tests with sitespeed.io and webpagetest private instance

## BackendJob
To run jmeter demo script: **Open BackendJob -> Build with Parameters -> Set build parameters -> Select scenario -> Build**
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_backendjob_run.png)

This job will start jmeter docker container and execute demo_scenario.jmx jmeter scenario
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jmeter_demo_scenario.png)

To open demo_scenario in local instance of Jmeter please install Plugin Manager https://jmeter-plugins.org/wiki/PluginsManager/. It will automatically install all required plugins.

### Jmeter test deliverables:
- **jmeter log file**
- **raw test results in report.log csv file**
- **jmeter HTML report(available after test is finished)** ![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_backendjob_jmeter_html_report.png )
- **grafana load test monitoring dashboard(real-time monitoring)** ![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/grafana_load_test_dashboard.png)

## FrontendJob
To run frontend test: **Open FrontendJob -> Build with Parameters -> Set build parameters -> Build**
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_frontendjob_run.png)

This job will start sitespeed.io docker container and run test with parameters using WebPageTest private instance 

Frontend test deliverables:
- **sitespeed.io HTML report**
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_frontendjob_sitespeed_html_report.png)
- **webpagetest HTML report**
![](https://github.com/serputko/performance-testing-framework/blob/master/docs/img/jenkins_frontendjob_webpagetest_html_report.png)
