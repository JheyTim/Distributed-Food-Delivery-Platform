# Distributed Food Delivery Platform

This project is a microservices-based distributed food delivery platform. The system allows users to authenticate, place orders, pay for their food, and track order progress in real time. The system also integrates with RabbitMQ for asynchronous communication between services.

The core functionality of the project is **complete**, including authentication, order processing, restaurant validation, and payment integration. However, some areas of the project have been deliberately skipped or are not fully polished.

## Table of Contents
- [Services](#services)
- [Technologies Used](#technologies-used)

## Services

The platform consists of three main microservices:

1. **Authentication Service**: Handles user authentication (JWT-based), login, and registration.
2. **Order Service**: Handles order placement, payment processing (via Stripe), and order status updates.
3. **Restaurant Service**: Manages restaurant details, validates restaurant availability, and processes incoming orders.
4. **RabbitMQ**: Used for asynchronous communication between the **Order Service** and the **Restaurant Service**.

## Technologies Used

- **Node.js**: Backend for microservices.
- **Express**: Web framework for building REST APIs.
- **MongoDB**: Database for storing users, orders, and restaurant data.
- **Mongoose**: ORM for interacting with MongoDB.
- **JWT (JSON Web Tokens)**: Authentication and authorization.
- **Stripe**: Payment gateway for handling order payments.
- **RabbitMQ**: Message broker for asynchronous communication.
- **Docker**: Containerization of microservices.

## Environment Variables
Each service requires certain environment variables to be set up. Here's a variables for each service:

### Authentication Service
- MONGO_URI
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- EMAIL_USER
- EMAIL_PASS

### Order Service
- PORT
- JWT_SECRET
- MONGO_URI
- STRIPE_SECRET_KEY

### Restaurant Service
- MONGO_URI
- PORT
