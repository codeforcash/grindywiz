FROM keybaseio/client:nightly-node
RUN mkdir /app && chown keybase:keybase /app
WORKDIR /app
COPY src/package*.json ./
RUN npm install # or use yarn
COPY build/. .
COPY src/problems.json .
SHELL ["/bin/bash", "-c"] 
CMD export start_time=$(date --iso-8601='seconds') && mkdir /app/logs/$start_time && node -r source-map-support/register /app/main.js &> /app/logs/$start_time/out.log
