// Empty service worker that does nothing - used to override any cached version
console.log('This is a blank service worker that does nothing');

// This service worker is intentionally empty and will unregister itself
self.addEventListener('install', function(event) {
  console.log('Installing empty service worker');
  self.skipWaiting(); // Skip waiting to activate
});

self.addEventListener('activate', function(event) {
  console.log('Activating empty service worker');
  event.waitUntil(
    self.registration.unregister()
      .then(() => {
        console.log('Service worker unregistered itself');
        return self.clients.matchAll();
      })
      .then(clients => {
        clients.forEach(client => {
          // Send a message to the client
          client.postMessage({
            msg: 'Service worker has been unregistered'
          });
        });
      })
  );
});

// Don't intercept any fetch events
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
