**TODO:**
- [ ] investigate server metrics monitoring for windows(now telegraf shows container metrics, not host)
- [ ] move jmeter script invocation from entrypoint script to jenkins job
- [ ] make dashboard default for user
- [ ] create job to do influxdb backups in jenkins
- [ ] modify legend labels for response time over time graphs max_avg -> avg. question- https://community.grafana.com/t/is-it-possible-to-change-legend-using-alias-by-when-series-are-selected-with-variable/4818
- [ ] distributed load testing, jenkins slaves, few backend listeners to one influxdb
- [ ] add volume to store webpagetest reports
- [ ] remove logging on job page plugin 
- [ ] add deploy key to repository
- [ ] setup jenkins job to pull changes from resository and rebuild containers
- [ ] rebuild sitespeed before job execution in jenkins

**Update readme/wiki:**
- [ ] how to use Portainer
- [ ] how to use WebPageTest private instance
- [ ] parameterizing jmeter scenarios with jemter properties
- [ ] sending jmeter test metrics to grafana(backend listener parameters)
- [ ] Load Test Monitoring grafana dashboard structure
- [ ] How to create own charts
- [ ] How to add processes to monitor in telegraf
- [ ] Add steps to change core # and RAM for linux VM on windows host
- [ ] How to remove plugins from Jenkins(remove manually from jenkins and remove from plugins file)
- [ ] How to make annotation on graph


**Done:**
- [x] add script that adds jmeter database to influxdb
- [x] use used_mem in % for memory graphs
- [x] set jmeter log saving to jenkins workspace /var/jenkins_home/workspace/
- [x] change PAMPUP to RAMPUP in jmeter job in jenkins
- [x] add name to telegraf host in docker config file
- [x] add jmeter docker container stop after build is aborted:
	add postbuild-task to jenkins for stopping jmeter docker containerin case of build abort
		add postbuild-task (log text:Build was aborted; Command:docker container stop jmeter)
		add --name jmeter to docker run command in jmeter job
	create some logic to be able run few jmeter tests
- [x] add throughput to composite graph on grafana dashboard
- [x] Add jenkins pre build step
		if docker container ls -a | grep jmeter;
	then
		docker container stop jmeter
		docker container rm jmeter
	fi
- [x] add hostname: telegraf-loadgenerator to telegraf docker file
- [x] add jenkins-home volume, influxdb home and grafana home
	volumes:
       - influxdb:/var/lib/influxdb
	jenkins-home:/var/jenkins_home
	grafana-home:/var/lib/grafana/

	jenkins-home:
	influxdb:
	grafana-home:
- [x] change jmeter download link to http://www-eu.apache.org/dist//jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz
- [x] add parameter-separator jenkins plugin
- [x] **Rejected** change backend job paramaters to persistent ones
- [x] separate load generator server metrics and other servers
- [x] fix min and max values in aggregate table in grafana report
- [x] add post build task to stop jmeter container in case of build abort
- [x] run jmeter container in host network
- [x] setup beanshell assertion for sending error messages to influxdb
- [x] add -e BUILD_NUMBER=$BUILD_NUMBER -e BUILD_URL=$BUILD_URL params to jenkins job and jmeter script 
- [x] add jenkins build number and url to jmeter demo scenario backend listener 'title'
- [x] parameterize all scenario-dependent values in backend listener
- [x] add tags with available scenarios to transactions variable
- [x] add or  "responseCode" =~ /(4|5)\\d{2}/ to error message table in grafana
- [x] set jenkins url
- [x] jenkins job is not updated if exists. do not delete because history will be dropped- use update https://support.cloudbees.com/hc/en-us/articles/218353308-How-to-update-job-config-files-using-the-REST-API-and-cURL-
- [x] add log parser to jenkins
- [x] setup jenkins log parsing with log parser
- [x] set default values for scenario-dependent values in backend listener
- [x] add test name filtering in grafana
- [x] gzip builds logs with compress build log plugin

