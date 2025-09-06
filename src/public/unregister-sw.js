// Unregister any service workers
if ('serviceWorker' in navigator) {
  // Unregister all service workers
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered');
    }
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        cacheNames.forEach(function(cacheName) {
          caches.delete(cacheName);
          console.log('Cache deleted:', cacheName);
        });
      });
    }
    
    // Reload page to ensure clean state
    console.log('Reloading page to ensure clean state...');
    // Commented out to avoid infinite reload: window.location.reload(true);
  });
}
