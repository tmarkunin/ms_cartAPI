FROM node
 
# Bundle app source
COPY . /src
 
# Install app dependencies
RUN cd /src; npm install
 
#export the mongo uri
ENV MONGO_URI mongodb://admin:FQAONRKCSXQTLYDL@bluemix-sandbox-dal-9-portal.3.dblayer.com:18179/admin?ssl=true 
 
EXPOSE  8080

CMD ["node", "/src/cartAPI.js"]