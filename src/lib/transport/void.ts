export function voidTransport() {
  return async () => {
    return {
      status: 500,
      statusText: 'No transport provided',
    };
  };
}
