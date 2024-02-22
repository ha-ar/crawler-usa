FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000
RUN chown -R node /app
USER node
CMD ["yarn", "start"]


