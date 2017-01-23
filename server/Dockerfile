FROM nodesource/jessie:7.0.0
ADD package.json package.json  
RUN npm install  
ADD . .  

EXPOSE 8000
EXPOSE 27017

CMD ["npm","start"]  