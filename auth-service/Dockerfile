# Use Node.js base image
FROM node:20.17.0-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the service port (assuming the service runs on port 5000)
EXPOSE 5000

# Command to start the app
CMD ["npm", "start"]
