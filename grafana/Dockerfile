FROM grafana/grafana:4.6.3

RUN apt-get update && \
    apt-get install jq 

COPY ./dashboards/ /dashboards/
COPY ./datasources/ /datasources/

COPY ./run1.sh /run1.sh

ENTRYPOINT ["bash","-x","/run1.sh"]