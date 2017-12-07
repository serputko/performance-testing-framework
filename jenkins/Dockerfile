FROM jenkins/jenkins

ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
COPY security.groovy /usr/share/jenkins/ref/init.groovy.d/security.groovy
COPY jobs/ /jobs/
COPY run.sh /run.sh
COPY plugins.txt /usr/share/jenkins/ref/

USER root
RUN xargs /usr/local/bin/install-plugins.sh < /usr/share/jenkins/ref/plugins.txt && \
apt-get -y update && \
apt-get -y install sudo && \
sudo usermod -aG staff jenkins
USER jenkins
ENV PATH "$PATH:/usr/local/bin/dind/"
ENTRYPOINT ["bash","-x","/run.sh"]
