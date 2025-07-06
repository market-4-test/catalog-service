
# Catalog Service

This project is a catalog service developed with NestJS. It provides an API for managing products, categories, brands, and other related entities within an e-commerce platform.

## 🚀 Getting Started

### Prerequisites

  * **Node.js**: Ensure you have Node.js installed (version \>= 20.11 is recommended).
  * **npm** or **yarn**: A package manager for installing dependencies.
  * **PostgreSQL**: The service uses a PostgreSQL database.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-address>
    cd catalog-service
    ```

2.  **Configure `.npmrc`:**
    To install private packages like `@market-4-test/contract-ts`, you need to create an `.npmrc` file in the root of the project and add your GitHub access token:

    ```
    @market-4-test:registry=https://npm.pkg.github.com/
    //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

### Configuration

1.  **Set up environment variables:**
    Create a `.env` file in the root directory of the project. This file will be used to store configuration data, such as database credentials and the server port.

    Example `.env` file content:

    ```
    # Server settings
    # Server settings
    PORT=3020

    # PostgreSQL database settings
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=demo
    DB_PASSWORD=demo
    DB_DATABASE=m4t-catalog
    ```

      * The database configuration is located in `src/app.module.ts`.
      * The default server port is `3020`, as specified in `src/main.ts`.

### Running the Application

  * **Development mode with hot-reload:**
    ```bash
    npm run start:dev
    ```
  * **Production mode:**
    ```bash
    npm run start:prod
    ```
  * **Build the project:**
    ```bash
    npm run build
    ```

### Testing

  * **Run all tests:**
    ```bash
    npm run test
    ```
  * **Run tests in watch mode:**
    ```bash
    npm run test:watch
    ```
  * **Run e2e tests:**
    ```bash
    npm run test:e2e
    ```
  * **Get a test coverage report:**
    ```bash
    npm run test:cov
    ```
    All scripts for running and testing are defined in `package.json`.

## 📚 API Documentation

Swagger UI is available for viewing and testing the API endpoints. After starting the application, navigate to the following URL:

[http://localhost:3020/api/catalog/docs](https://www.google.com/search?q=http://localhost:3020/api/catalog/docs)

The prefix for all API routes is `/api/catalog/v1/`.

## 📖 Project Structure

The project has a modular structure, with the main modules located in the `src/modules` directory:

  * **Products**: Manage products.
  * **Categories**: Manage categories.
  * **Brands**: Manage brands.
  * **Tags**: Manage tags.
  * **Stocks**: Manage stock levels.
