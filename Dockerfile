FROM node:latest AS build
WORKDIR /frontend
COPY web/frontend/ /frontend/
RUN npm install
RUN npm run build 

FROM node:latest AS runtime
WORKDIR /groundstation
COPY web/backend /groundstation
RUN npm install
COPY --from=build /frontend/dist/ /groundstation/public/
ENV NODE_ENV=production
USER node
ENTRYPOINT [ "node", "app" ]    
