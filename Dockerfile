FROM nginx:alpine
COPY index.html style.css utils.js script.js /usr/share/nginx/html/
EXPOSE 80
