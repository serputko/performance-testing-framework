FROM grafana/grafana:5.1.5

USER root
RUN apt-get update && \
    apt-get -y install jq 

USER grafana
COPY ./dashboards/ /dashboards/
COPY ./datasources/ /datasources/
COPY ./scripted_dashboards/ /usr/share/grafana/public/dashboards/

COPY ./run1.sh /run1.sh

ENTRYPOINT ["bash","-x","/run1.sh"]