FROM jenkins/jenkins

ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false -Dhudson.model.DirectoryBrowserSupport.CSP=''"
COPY security.groovy /usr/share/jenkins/ref/init.groovy.d/security.groovy
COPY configure-markup-formatter.groovy /usr/share/jenkins/ref/init.groovy.d/configure-markup-formatter.groovy
COPY jobs/ /jobs/
COPY run.sh /run.sh
COPY error_parsing /error_parsing
COPY hudson.plugins.logparser.LogParserPublisher.xml /var/jenkins_home/hudson.plugins.logparser.LogParserPublisher.xml
COPY plugins.txt /usr/share/jenkins/ref/

USER root
RUN xargs /usr/local/bin/install-plugins.sh < /usr/share/jenkins/ref/plugins.txt && \
apt-get -y update && \
apt-get -y install sudo && \
sudo usermod -aG staff jenkins && \
echo "jenkins ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
ENV PATH "$PATH:/usr/local/bin/dind/"

ENTRYPOINT ["bash","-x","/run.sh"]
