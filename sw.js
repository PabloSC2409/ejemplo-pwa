const CACHEE ='cache';
const CACHE_DINAMICO ='dinamico';
const CACHE_INMUTABLE ='inmutable';

self.addEventListener('install', evento=>{
    /*seleccionar el tipo de cache with network fallback nos permite 
    cargar los archivos para poder almacenarlos en el cache inicial. 
    En el cache inmutable mandas llamar archivos que no se pueden modificar.
    El cache dinamico es para qye se guarden los archivos y que se limiten 
    5 archivos que no se encuentran en la pagina principal.
    la ventajas es de que se podra visualizar la aplicacion aunque no
    tengamos acceso a internet.
    la desventaja es que los archivos guardados en shell abre un espacio dinamico.*/
    const promesa =caches.open(CACHEE)
    .then(cache=>{
    return cache.addAll([
        //'/',
        'index.html',
        'css/icons.css',
        'css/googleapi.css',
        'manifest.json',
        'js/bootstrap.min.js',
        'js/application.js',
        'js/app.js',
        'images/404.jpg',
        'offline.html',
        'form.html',
        'css/styles.css',
        'css/londinium-theme.css'
    ]);
    });
    const cacheInmutable =  caches.open(CACHE_INMUTABLE)
        .then(cache => cache.add( '/css/bootstrap.min.css'));
            

        evento.waitUntil(Promise.all([promesa,cacheInmutable]));
});

self.addEventListener('fetch', evento => {  
    //Estrategia CACHE WITH NETWORK FALLBACK
    const respuesta=caches.match(evento.request)
        .then(res=>{
        //si el archivo existe en cache retornarlo
            if (res) return res;
            
                     console.log('No existe', evento.request.url);
                //La petición localizada en la web
                return fetch(evento.request)
                .then(resWeb=>{
                //El archivo recuperado se almacena en resWeb 
                //el archivo se descarga de la web, cuando no se encuentra en cache 
                    caches.open(CACHE_DINAMICO)
                .then(cache=>{
                //El archivo descargado de la web se debe de subir 
                     cache.put(evento.request,resWeb);
                     //llamamos la limpieza al cargar un nuevo archivo y esto hara que se limpie el cache dinamico
                        limpiarCache(CACHE_DINAMICO,5);
                })
                //el archivo recuperado se visualiza en la página
            return resWeb.clone();
            });
        }).catch(errr => {
            
            if(evento.request.headers.get('accept').includes('text/html')){
            //muestra nuestra página offline que esta en cache.
            return caches.match('/offline.html');
            }else if(evento.request.headers.get('accept').includes('png')){
                // muestra nuestra img.png que esta en cache
                return caches.match('images/404.jpg');
                }
            });
        
            evento.respondWith(respuesta);
        
            function limpiarCache(nombreCache, numeroItems){
                //abrir cache
                caches.open(nombreCache)
                    .then(cache=>{
                        return cache.keys()
                            .then(keys=>{
                                if (keys.length>numeroItems){
                                    cache.delete(keys[0])
                                    .then(limpiarCache(nombreCache, numeroItems));
                }
                });
                });
            }
        
            });