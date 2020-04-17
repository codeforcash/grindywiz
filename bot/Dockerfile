FROM keybaseio/client:nightly-node
RUN mkdir /app && chown keybase:keybase /app
WORKDIR /app
COPY src/package*.json ./
RUN npm install # or use yarn
COPY build/. .
COPY src/problems.json .
CMD node -r source-map-support/register /app/main.js
