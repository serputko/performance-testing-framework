Docker based performance testing framework

Framework architecture:
https://github.com/serputko/performance-testing-framework/blob/master/docs/img/Framework%20structure.png

To start framework:
	1. git clone this repository
	2. open performance-testing-framework dir
	3. docker-compose up -d
	All containers should be up and running
	
Services:
- jenkins localhost:8181
- grafana localhost:8857
- portainer localhost:9000
- webpagetest server localhost:80
- influxdb localhost:8653