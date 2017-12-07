FROM webpagetest/server

COPY locations.ini /var/www/html/settings
COPY 000-default.conf /etc/apache2/sites-enabled
	
RUN touch /var/log/apache2/access1.log \
	touch /var/log/apache2/error1.log \
	source /etc/apache2/envvars \
	service supervisor stop \
	service supervisor start