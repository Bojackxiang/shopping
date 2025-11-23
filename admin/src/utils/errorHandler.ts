export const handleError = (error: any) => {
  console.log('Error Handler: Full error details: ', error);

  throw error;
};
