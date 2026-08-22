FROM nginx:alpine

COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh", "-c", "echo \"window.APP_CONFIG = { API_URL: '$API_URL' };\" > /usr/share/nginx/html/config.js && nginx -g 'daemon off;'"]