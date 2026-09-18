const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const success = (body: any, statusCode = 200) => {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
};

export const error = (statusCode: number, message: string) => {
  return {
    statusCode,
    headers,
    body: JSON.stringify({ error: message }),
  };
};