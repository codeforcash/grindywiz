FROM keybaseio/client:nightly-node
RUN mkdir /app && chown keybase:keybase /app
WORKDIR /app
COPY package*.json ./
RUN npm install # or use yarn
COPY . .
CMD node /app/main.js

