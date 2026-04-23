//Centralized error handling

const PG_MESSAGES = {
  '23505': 'A record with this value already exists.',
  '23502': 'A required field is missing.',
  '23514': 'The value does not meet the required constraints.',
  '22P02': 'Invalid value format provided.',
  '22007': 'Invalid date or time format.',
  '22003': 'A numeric value is out of the allowed range.',
  '42703': 'An unrecognised field was submitted.',
};

const errorHandling = (err, req, res, next) => {
  console.error(err.stack);

  // Postgres errors have a `code` property
  if (err.code && PG_MESSAGES[err.code]) {
    const detail = err.detail ? ` (${err.detail})` : '';
    return res.status(400).json({
      status: 400,
      message: PG_MESSAGES[err.code] + detail,
    });
  }

  // Pass through any error that already carries a statusCode / status
  const status = err.statusCode || err.status || 500;
  const message = (status < 500 && err.message) ? err.message : "Something went wrong";

  res.status(status).json({
    status,
    message,
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  });
};

export default errorHandling;