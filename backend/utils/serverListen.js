export function listenWithFallback(server, initialPort, maxAttempts = 5, host) {
  return new Promise((resolve, reject) => {
    const tryPort = (port, attempt) => {
      const normalizedPort = Number.parseInt(port, 10);

      if (Number.isNaN(normalizedPort)) {
        reject(new Error(`Invalid port value: ${port}`));
        return;
      }

      const onError = (err) => {
        server.removeListener('error', onError);

        if (err.code === 'EADDRINUSE' && attempt < maxAttempts) {
          console.warn(`⚠️ Port ${normalizedPort} is busy, falling back to an available port...`);
          setImmediate(() => tryPort(0, attempt + 1));
          return;
        }

        reject(err);
      };

      server.once('error', onError);
      const onListen = () => {
        server.removeListener('error', onError);
        resolve(server.address().port);
      };

      if (host) {
        server.listen(normalizedPort, host, onListen);
      } else {
        server.listen(normalizedPort, onListen);
      }
    };

    tryPort(initialPort, 1);
  });
}
