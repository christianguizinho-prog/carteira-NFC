const CACHE_NAME =
    "nfc-wallet-v1";

const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./tag.html",

    "./style.css",

    "./script.js",

    "./supabase.js",

    "./tag.js",

    "./manifest.json"

];


// =====================================================
// INSTALAÇÃO
// =====================================================

self.addEventListener(
    "install",
    event => {

        console.log(
            "NFC Wallet Service Worker instalado."
        );

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    cache => {

                        return cache.addAll(
                            FILES_TO_CACHE
                        );

                    }
                )

        );

        self.skipWaiting();

    }
);


// =====================================================
// ATIVAÇÃO
// =====================================================

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    keys => {

                        return Promise.all(

                            keys
                                .filter(
                                    key =>
                                        key !==
                                        CACHE_NAME
                                )
                                .map(
                                    key =>
                                        caches.delete(
                                            key
                                        )
                                )

                        );

                    }
                )

        );

        self.clients.claim();

    }
);


// =====================================================
// BUSCAR ARQUIVOS
// =====================================================

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        if (
            request.method !== "GET"
        ) {
            return;
        }


        event.respondWith(

            caches
                .match(request)
                .then(
                    cachedResponse => {

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }


                        return fetch(request)
                            .then(
                                networkResponse => {

                                    if (
                                        !networkResponse ||
                                        networkResponse.status !== 200 ||
                                        networkResponse.type ===
                                            "opaque"
                                    ) {

                                        return networkResponse;

                                    }


                                    const responseClone =
                                        networkResponse.clone();


                                    caches
                                        .open(
                                            CACHE_NAME
                                        )
                                        .then(
                                            cache => {

                                                cache.put(
                                                    request,
                                                    responseClone
                                                );

                                            }
                                        );


                                    return networkResponse;

                                }
                            )
                            .catch(
                                () => {

                                    return caches.match(
                                        "./index.html"
                                    );

                                }
                            );

                    }
                )

        );

    }
);