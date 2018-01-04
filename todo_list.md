**TODO:**
- [ ] add test name filtering in grafana
- [ ] investigate server metrics monitoring for windows(now telegraf shows container metrics, not host)
- [ ] move jmeter script invocation from entrypoint script to jenkins job


**Update readme/wiki:**
- [ ] how to use Portainer
- [ ] how to use WebPageTest private instance
- [ ] parameterizing jmeter scenarios with jemter properties
- [ ] sending jmeter test metrics to grafana(backend listener parameters)
- [ ] Load Test Monitoring grafana dashboard structure
- [ ] How to create own charts


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
