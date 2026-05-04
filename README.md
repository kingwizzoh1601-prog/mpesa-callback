# MPESA Callback

## Description
This project is a callback handler for MPESA payment notifications. It integrates with the MPESA API to process payment callbacks and update transaction statuses in the system.

## Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/kingwizzoh1601-prog/mpesa-callback.git
   ```
2. Navigate into the project directory:
   ```bash
   cd mpesa-callback
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

## Usage
To start the application, run:
```bash
npm start
```

## API Endpoints
- `POST /api/mpesa/callback`
  - Description: Handles the callback from MPESA after a transaction.
  - Request Body: JSON object containing transaction details.
  - Response: Success or error message.

## Environment Variables
Make sure to set the following environment variables:
- `MPESA_CONSUMER_KEY`: Your MPESA consumer key
- `MPESA_SECRET`: Your MPESA secret
- `MPESA_SHORTCODE`: Your MPESA shortcode
- `NODE_ENV`: Set this to `development` or `production`.

## Render Deployment Guide
1. Create a new web service on Render.
2. Connect your GitHub repository.
3. Set environment variables in the Render dashboard as specified above.
4. Deploy the service. Render will build and start your application automatically.

## License
This project is licensed under the MIT License.