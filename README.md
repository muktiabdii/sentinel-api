# Sentinel API

A backend API for a blockchain-based warranty management system built with Solidity and Ethereum Sepolia testnet. This project integrates smart contracts for creating and managing digital warranties on the blockchain.

## Features

- **User Authentication**: JWT-based authentication for secure user sessions
- **Product Management**: CRUD operations for products with image uploads via Cloudinary
- **Shopping Cart**: Add, update, and manage cart items
- **Transaction Processing**: Handle payments via Midtrans integration
- **Blockchain Warranties**: Create and verify warranties on Ethereum Sepolia using smart contracts
- **Warranty Tracking**: Store and retrieve warranty details with blockchain verification

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Knex.js query builder
- **Blockchain**: Ethereum Sepolia testnet, Solidity smart contracts, Ethers.js
- **Authentication**: JSON Web Tokens (JWT), bcrypt for password hashing
- **File Uploads**: Multer with Cloudinary integration
- **Payments**: Midtrans payment gateway
- **Other**: dotenv for environment variables

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Ethereum wallet with Sepolia testnet ETH for gas fees
- Smart contract deployed on Sepolia (ABI and contract address required)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/sentinel-api.git
   cd sentinel-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in the required values:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/sentinel_db
     JWT_SECRET=your_jwt_secret
     RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
     WALLET_PRIVATE_KEY=your_wallet_private_key
     SMART_CONTRACT_ADDRESS=0xYourSmartContractAddress
     CLOUDINARY_CLOUD_NAME=your_cloudinary_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     MIDTRANS_SERVER_KEY=your_midtrans_server_key
     MIDTRANS_CLIENT_KEY=your_midtrans_client_key
     ```

4. **Run database migrations**:
   ```bash
   npx knex migrate:latest
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

The API will be running on `http://localhost:3000` (or your configured port).

## Usage

### API Endpoints

- **Authentication**: `/api/auth`
  - POST `/register` - User registration
  - POST `/login` - User login

- **Products**: `/api/products`
  - GET `/` - Get all products
  - POST `/` - Create product (admin)
  - PUT `/:id` - Update product
  - DELETE `/:id` - Delete product

- **Cart**: `/api/cart`
  - GET `/` - Get user's cart
  - POST `/` - Add item to cart
  - PUT `/:id` - Update cart item
  - DELETE `/:id` - Remove from cart

- **Transactions**: `/api/transactions`
  - GET `/` - Get user's transactions
  - POST `/` - Create transaction

- **Warranties**: `/api/warranties`
  - GET `/` - Get user's warranties
  - POST `/` - Create warranty (triggers blockchain transaction)

- **Users**: `/api/users`
  - GET `/profile` - Get user profile
  - PUT `/profile` - Update profile

### Blockchain Integration

Warranties are created on the Ethereum Sepolia testnet. Each warranty creation involves:
1. Calling the smart contract's `createWarranty` function
2. Paying gas fees in Sepolia ETH
3. Storing transaction hash for verification

## Development

- Run tests: `npm test` (currently not implemented)
- Database seeding: `npx knex seed:run`
