const cacheName = 'puzzle-generator'

/*/ Cache required files /*/
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './logo.svg',
        './main.css',
        './main.js',
        './generic/base-generator.js',
        './generic/enums.js',
        './takuzu/generator.js',
        './takuzu/takuzu-board-generator.js',
      ])
    })
  )
})

/*/ Serve available files from cache /*/
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => { return response || fetch(event.request) })
  )
})
