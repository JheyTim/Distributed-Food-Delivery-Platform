# Use an official Node.js runtime as a parent image
FROM node:20.17.0-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the app runs on
EXPOSE 5000

# Command to start the application
CMD ["npm", "start"]
