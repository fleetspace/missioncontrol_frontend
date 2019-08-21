FROM node:8

ADD package-lock.json /package-lock.json
ADD package.json /package.json

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin

ARG NODE_ENV
RUN npm ci

COPY ./entrypoint /entrypoint

WORKDIR /app
ADD . /app

EXPOSE 3000
EXPOSE 35729

ENTRYPOINT ["/entrypoint"]
CMD ["start"]
