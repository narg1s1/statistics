ARG BUILD_NODE_IMAGE
ARG PROD_NGINX_IMAGE

FROM $BUILD_NODE_IMAGE AS build

COPY package.json package-lock.json .npmrc /payever/
RUN cd /payever && npm ci

COPY . /payever
RUN cd /payever && npm run build


FROM $PROD_NGINX_IMAGE

ARG CI_COMMIT_SHA

COPY --from=build /payever/dist /payever

COPY ./deploy /payever/deploy
RUN chmod 755 /payever/deploy -R

RUN mkdir /payever/api && echo $CI_COMMIT_SHA && echo $CI_COMMIT_SHA > /payever/api/status
