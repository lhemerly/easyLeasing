# Easy Leasing

Easy Leasing is a leasing contract management system that allows users to create and manage contracts. The system is built using Node.js, MongoDB, and React.

## Features

The following features are currently implemented in the system:

- Users can create contracts by providing basic contract details such as start date, end date, amount, and interest rate.
- The system automatically calculates the contract term and generates installment details based on the provided contract details.
- Users can view a list of all existing contracts and their details.
- Users can view the details of a specific contract by clicking on it in the list.
- The system automatically calculates the present value adjustment for each installment and stores it in the database.
- Users can calculate the right of use asset value for a contract based on the present value of the installments.


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install and run this project, follow these steps:

1. Clone this repository to your local machine.
2. Install the required dependencies by running `npm install` in both the `client` and `server` directories.
3. Create a `.env` file in the `server` directory with the following contents:

```
MONGODB_URI=<your MongoDB connection string>
```


4. Start the server by running `npm start` in the `server` directory.
5. Start the client by running `npm start` in the `client` directory.

## Usage

Once the server and client are running, you can use the application by following these steps:

1. Open a web browser and go to `http://localhost:3000`.
2. Use the application to perform various tasks.

## Contributing

Contributions to this project are welcome. To contribute, follow these steps:

1. Fork this repository to your own account.
2. Create a branch for your changes.
3. Make your changes in your branch.
4. Run prettier and eslint with the repository configuration files.
5. Push your changes to your fork.
6. Submit a pull request from your fork to this repository.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
