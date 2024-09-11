# Use the official Node.js image as the base image
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the React app
RUN npm run build

# Use a smaller image for serving the built app
FROM nginx:alpine

# Copy the build output to the Nginx HTML folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx and serve the React app
CMD ["nginx", "-g", "daemon off;"]

