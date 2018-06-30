FROM grafana/grafana:latest

USER root
RUN apt-get update && \
    apt-get install jq 

USER grafana
COPY ./dashboards/ /dashboards/
COPY ./datasources/ /datasources/

COPY ./run1.sh /run1.sh

ENTRYPOINT ["bash","-x","/run1.sh"]