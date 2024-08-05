FROM node:20
ENV NPM_CONFIG_LOGLEVEL verbose
WORKDIR /home/ubuntu/new_parkman
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force
RUN echo "America/Los_Angeles" > /etc/timezone
ARG NODE_ENV production
ENV NODE_ENV $NODE_ENV
RUN rm -rf dist 
RUN npm run clean-linux 
ENV TZ="America/Los_Angeles"
CMD ["bash", "-c", "node dist/index.js"]


