const CACHE_NAME =
    "nfc-wallet-v4";

const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./tag.html",

    "./style.css",

    "./script.js",

    "./nfc.js",

    "./features.js",

    "./supabase.js",

    "./tag.js",

    "./manifest.json",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];


// =====================================================
// INSTALAÇÃO
// =====================================================

self.addEventListener(
    "install",
    event => {

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
                .then(
                    () => {

                        return self.skipWaiting();

                    }
                )

        );

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
                .then(
                    () => {

                        return self.clients.claim();

                    }
                )

        );

    }
);


// =====================================================
// BUSCAR ARQUIVOS
//
// Rede primeiro para manter o app sempre atualizado,
// com o cache servindo apenas como reserva offline.
// Requisições externas (Supabase, CDN, fontes) e
// métodos diferentes de GET passam direto pela rede.
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


        const url =
            new URL(request.url);


        if (
            url.origin !==
            self.location.origin
        ) {
            return;
        }


        event.respondWith(

            fetch(request)
                .then(
                    networkResponse => {

                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === "basic"
                        ) {

                            const responseClone =
                                networkResponse.clone();


                            caches
                                .open(CACHE_NAME)
                                .then(
                                    cache => {

                                        cache.put(
                                            request,
                                            responseClone
                                        );

                                    }
                                );

                        }


                        return networkResponse;

                    }
                )
                .catch(
                    () => {

                        return caches
                            .match(
                                request,
                                {
                                    ignoreSearch:
                                        request.mode ===
                                        "navigate"
                                }
                            )
                            .then(
                                cachedResponse => {

                                    if (cachedResponse) {

                                        return cachedResponse;

                                    }


                                    if (
                                        request.mode ===
                                        "navigate"
                                    ) {

                                        return caches.match(
                                            "./index.html"
                                        );

                                    }


                                    return Response.error();

                                }
                            );

                    }
                )

        );

    }
);
