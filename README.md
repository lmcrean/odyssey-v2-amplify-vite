# AWS Amplify React+Vite Starter Template

This repository provides a starter template for creating applications using React+Vite and AWS Amplify, emphasizing easy setup for authentication, API, and database capabilities.

## Overview

This template equips you with a foundational React application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws) of our documentation.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

***

# Odyssey Project

A modern social media platform built with React, TypeScript, and AWS Amplify, focusing on creating meaningful connections through shared experiences and interests.

the first version of this project used Django Rest Framework and React. It can be found [here](https://github.com/lmcrean/odyssey-api)

## 🚀 Tech Stack

- **Frontend:**
  - React 18+ with TypeScript
  - Vite for blazing-fast development
  - Tailwind CSS for styling
  - AWS Amplify for cloud integration

- **Backend Services (AWS):**
  - GraphQL API for backend
  - S3 for media storage
  - Lambda functions for serverless operations
  - DynamoDB for database

## ✨ Features

### Core Features
- Authentication
  - sign up
  - sign in
  - password reset
  - username change
- Profiles
  - Follows/unfollows
- Post creation and management (media and text)
  - Post Likes
  - Post Comments
- Messaging (media and text)

### Technical Features
- Modern React patterns and best practices
- Type-safe development with TypeScript
- Responsive design with Tailwind CSS
- Secure authentication flow
- Optimized media handling
- Real-time data synchronization

## 🛠 Setup & Development

### Prerequisites
- Node.js (v18.18.0 or higher)
- npm/yarn
- AWS Account
- AWS CLI configured locally

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Configure AWS Amplify:**
   ```bash
   amplify init
   amplify push
   ```

### Environment Variables
Create a `.env` file in the frontend directory with the following variables:
```
VITE_AWS_REGION=your-region
VITE_API_ENDPOINT=your-api-endpoint
VITE_USER_POOL_ID=your-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-client-id
```

## 📁 Project Structure

## 🔒 Security Considerations

- All AWS credentials should be managed through AWS Secrets Manager
- Environment variables should never be committed to the repository
- Follow AWS security best practices for IAM roles and permissions
- Implement proper input validation and sanitization
- Use HTTPS for all API communications

## 🧪 Testing

- Unit tests for components and utilities
- Integration tests for API flows
- End-to-end tests for critical user journeys

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [AWS Amplify Documentation](https://docs.amplify.aws)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- 
## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using React, TypeScript, and AWS Amplify
