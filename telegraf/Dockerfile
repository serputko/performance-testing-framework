FROM telegraf:latest

COPY ./telegraf.conf /etc/telegraf/telegraf.conf
COPY ./entrypoint1.sh /entrypoint1.sh

ENTRYPOINT ["bash","-x","/entrypoint1.sh"]
CMD ["telegraf"]