'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "favicon-16x16.png": "c9c5cc13e3796ce5737146f8eb9f9283",
"version.json": "acf5eac89344bc3b394f281a3d916bde",
"favicon.ico": "05e01a9b6c724e0f1b1236e9a3e95eab",
"index.html": "272198bc8b0fc4ef61804e38189745d2",
"/": "272198bc8b0fc4ef61804e38189745d2",
"android-chrome-192x192.png": "bd9e87712daf2b945669776d9100d9e2",
"apple-touch-icon.png": "b118c12993edeb86a2cbb8952a9e4244",
"styles.css": "186aa6dae48f5bd5d0d3e271062e0cb5",
"main.dart.js": "d00fbcaebd5fcdccfedff25838063aa9",
"android-chrome-512x512.png": "17791d66407a287f1e486227df35c8a1",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "fc28db9f508a22c74f09d11b22704b03",
"icons/Icon-maskable-512.png": "e1ca9c8a22007e68c8ab4f77fb5478c1",
"icons/Icon-512.png": "863e27074904c5a5654a4f4b1e5c4cb0",
"manifest.json": "a077ccea463a499db093bb29b7be5786",
"assets/AssetManifest.json": "ac2bc8021e6967f36ccf7be263e548cc",
"assets/NOTICES": "349ccf2b80a91dd55eaa60175ff6b7df",
"assets/FontManifest.json": "5f7af435cf074e7f11e70fab42aea41e",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/cera-gr-bold.otf": "d04a02d7a7154f19baca5838674deea3",
"assets/fonts/cera-gr-medium-italic.otf": "c62e0d9163e04d73ff77419b0c29f212",
"assets/fonts/cera-gr-thin.otf": "71dcfdef062d6a61ed62dd6175692e03",
"assets/fonts/cera-gr-light-italic.otf": "5692c5696041842fb26eb49d363374cb",
"assets/fonts/cera-gr-regular.otf": "84078a654482d9b91bd85c8a15756c31",
"assets/fonts/cera-gr-black.otf": "c3867af54de009e23007d2aa94284d3d",
"assets/fonts/cera-gr-bold-italic.otf": "f894cf33a9f6c2096f1d2747bcd28a84",
"assets/fonts/cera-gr-medium.otf": "7a1a725d35c0a152d42228eaf281c9d6",
"assets/fonts/cera-gr-light.otf": "c8809b5d3bbef37069f127387682838a",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/fonts/cera-gr-black-italic.otf": "28f57005bdb51fd52002560e05d60c82",
"assets/fonts/cera-gr-regular-italic.otf": "fb235b8c7385942214d2973ccfacc332",
"assets/fonts/cera-gr-thin-italic.otf": "2e6083bca0399b018b58700009cd3ec6",
"assets/assets/images/sad_face.png": "a7668096b30d0b67420ae15cb3a3bdd3",
"assets/assets/images/eraser.png": "4f43fa6eed21e29d03d16883f3c37b3f",
"assets/assets/text_bubbles/thinking_bubble.png": "0f26578616d003e1a33e90c6cab0fc9a",
"assets/assets/text_bubbles/speech_bubble.png": "9e5448cc0eef7fff4a8ef0fc1faa4abe",
"favicon-32x32.png": "8767aef4ef32bb024f8963b553722396"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
