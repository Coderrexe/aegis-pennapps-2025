# Use an official Node.js runtime as a parent image
# Using a specific version is good practice for consistency
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# This is done first to leverage Docker's layer caching
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the application's code to the working directory
COPY . .

# Make port 3000 available to the world outside this container
# This is the default port for Vite/React dev servers
EXPOSE 3000

# Command to run the application
# This will start the development server
CMD ["npm", "run", "dev"]
