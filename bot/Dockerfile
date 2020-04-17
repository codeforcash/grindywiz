FROM keybaseio/client:nightly-node
RUN mkdir /app && chown keybase:keybase /app
WORKDIR /app
COPY src/package*.json ./
RUN npm install # or use yarn
COPY build/. .
CMD node /app/main.js
