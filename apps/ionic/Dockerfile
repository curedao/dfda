# FROM cypress/browsers:node10.2.1-chrome74 # Chrome has lots of timeouts for some reason
FROM cypress/base:10

# Optionally pass proxy information to get internet connectivity within npm ci
# postinstall hooks when running behind corporate proxies.
ARG http_proxy
ARG https_proxy
ARG no_proxy

WORKDIR /app

# dependencies will be installed only if the package files change
COPY package.json .
COPY package-lock.json .
# Fixes cannot find card '0' https://github.com/cypress-io/cypress-docker-images/issues/52
COPY tests/asound.conf /etc/asound.conf

# by setting CI environment variable we switch the Cypress install messages
# to small "started / finished" and avoid 1000s of lines of progress messages
# https://github.com/cypress-io/cypress/issues/1243
ENV CI=1
RUN npm ci
# verify that Cypress has been installed correctly.
# running this command separately from "cypress run" will also cache its result
# to avoid verifying again when running the tests
RUN npx cypress verify
