# Base image
FROM node:alpine
# Make folder to put our files in
RUN mkdir -p /app/backend
# Set working directory so that all subsequent command runs in this folder
WORKDIR /app/backend
# Copy package json and install dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install
# Copy our app
COPY . .
# Expose port to access server
EXPOSE 5005
# Command to run our app
CMD [ "yarn", "start"]