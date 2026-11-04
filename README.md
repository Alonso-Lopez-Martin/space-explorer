# Explorador de Exoplanetas & Sistema Solar 3D

Misión M3 · Reactor Core / React 19 + TypeScript — Web Development I.

## Cómo probarlo
Para arrancar este proyecto necesitas tener Node.js instalado. Abre la terminal en la carpeta del proyecto y ejecuta:
1. `npm install` (para instalar las dependencias, incluyendo Three.js y React Three Fiber).
2. `npm run dev` (para levantar el servidor de desarrollo local de Vite).

Abre el enlace de `localhost` indicado en tu navegador. Desde la pantalla de inicio («Space Explorer»), podrás alternar de forma fluida entre el **Simulador 3D Interactivo del Sistema Solar (JPL Horizons)** y el **Explorador de Exoplanetas** (con historial de búsquedas recientes y comparador cara a cara entre exoplanetas).
*Nota importante:* El proyecto incluye un proxy configurado en `vite.config.ts` para redirigir las peticiones a la API de la NASA de manera transparente y segura durante el desarrollo.

## Estructura del proyecto
```
src/
├── App.tsx                  # solo decide qué pantalla se ve (home / solar / exo)
├── components/
│   ├── HomeMenu.tsx         # menú de inicio
│   ├── ModuleCard.tsx       # tarjeta clicable (es un )
│   ├── ViewShell.tsx        # título + botón de volver, común a las dos vistas
│   ├── ExoplanetExplorer.tsx  # vista del buscador (búsqueda, historial y comparador)
│   ├── RecentSearches.tsx   # barra de búsquedas recientes persistida
│   ├── PlanetComparison.tsx # comparador cara a cara entre dos exoplanetas
│   ├── SearchBar.tsx · PlanetList.tsx · PlanetViewer.tsx · PlanetSphere.tsx · StatItem.tsx
│   └── solar/               # todo lo del simulador 3D
│       ├── SolarSystemMap.tsx   # orquestador puro: estado de foco + Canvas
│       ├── SolarLoadingOverlay.tsx # overlay de carga del mapa 3D
│       ├── PlanetBody · MoonBody · Sun · OrbitPath · BodyLabel
│       ├── CameraController.tsx
│       └── BodyInfoPanel · BodySelector · hoverCursor
├── data/solarSystem.ts      # planetas, lunas, texturas y distancias de reserva
├── hooks/
│   ├── useFetch.ts          # hook genérico (AbortController, loading derivado, reload)
│   ├── useLocalStorage.ts   # hook genérico con sincronización entre pestañas (storage event)
│   ├── useNasaApi.ts        # construye la consulta del archivo de exoplanetas sobre useFetch
│   ├── useJplPositions.ts   # posiciones en paralelo de los planetas desde JPL Horizons
│   └── useFocusTarget.ts    # deriva coordenadas y tamaño del objetivo enfocado en el mapa 3D
└── utils/
├── astro-calc.ts        # funciones pequeñas de física, habitabilidad, texturas y formato
├── jpl.ts               # cliente de efemérides de JPL Horizons
└── cn.ts                # helper reutilizable para concatenar clases CSS condicionales
```

## Uso de IA
Usé Gemini como pareja de programación y consultor técnico fase a fase para solventar desafíos avanzados de tipado en TypeScript y renderizado 3D.
Ejemplo de prompt real: *"Configura un componente de React Three Fiber que consuma vectores cartesianos de la API de JPL Horizons, dibuje órbitas elípticas con BufferGeometry y permita zoom adaptativo al hacer clic en un astro"*.
Verifiqué cada cambio probando la aplicación en el navegador (comprobando que la consola de compilación de Vite no mostrara errores de tipo, linter o advertencias de efectos), comprobando el comportamiento del motor gráfico a 60 FPS y forzando casos límite en las búsquedas asíncronas.
Escribí a mano: La arquitectura de navegación global de doble vista (`App.tsx`), la distribución y selección de las texturas equirectangulares estáticas en `/public` (incluyendo la Tierra, lunas de Marte, Júpiter, Saturno y Urano), la estructura modular de los componentes atómicos (`StatItem`, `PlanetSphere`, `PlanetList`, `PlanetViewer`) y la aplicación de los principios de diseño de la Gestalt en el menú de inicio.
En las revisiones posteriores al feedback de la corrección, usé IA para pulir la división de componentes, extraer los estilos inline a CSS, partir `astro-calc.ts` en funciones pequeñas, extraer `useFocusTarget` y afinar las dependencias de `useFetch` y `useLocalStorage`. Cada cambio lo revisé leyendo el diff y comprobando el comportamiento en el navegador.

## Texturas prestadas
La biblioteca de imágenes de la NASA no tenía ni un render ni una textura descargable de **Mercurio** ni de **la Luna**, así que usan la textura de Caronte (`Pluto_Charon.jpg`), que es una superficie gris y llena de cráteres y encaja bien a la vista. **Urano** tampoco tiene textura propia, así que reutiliza la de Neptuno, pero se le aplica un baño de luz (tinte emisivo) para darle su característico tono azul clarito y lechoso, logrando diferenciarlo del azul profundo de Neptuno. Esta sustitución la hablé con el profesor en clase y no hay problema. Está comentada también en `src/data/solarSystem.ts`.

## Autopsia
1. **Migración a React 19 y Tipado Estricto (Verbatim ModuleSyntax):** Reconstruir toda la lógica anterior exigió adaptar componentes funcionales puros con interfaces estrictas en TypeScript, evitando por completo el uso de tipos `any`. Descarté usar tipados genéricos o laxos que pudieran ocultar fallos de compilación, asegurando la alineación total con la regla de importación de tipos (`import type`) requerida por la configuración del linter.
2. **Sincronización de Coordenadas 3D y Prevención de Bucles en la Cámara:** Al integrar Three.js con la API REST de JPL Horizons, nos enfrentamos a problemas donde la cámara anulaba los comandos de paneo y zoom del usuario debido a bucles de actualización en el ciclo de renderizado (`useFrame`). Descarté controlar la posición de la cámara de forma rígida y diseñé un controlador inteligente que realiza una transición suave (*lerp*) hacia el objetivo seleccionado pero libera el control orbital de inmediato para permitir la navegación libre del usuario.

### Revisión tras el feedback de la corrección
Cambios hechos tras las rondas de feedback, agrupados por apartado de la rúbrica.

#### Componentización
3. **`App.tsx` como enrutador puro y `SolarSystemMap` con `useFocusTarget`.** `HomeMenu`, `ModuleCard`, `ViewShell` y `ExoplanetExplorer` reparten la estructura general; en el mapa 3D extraje el cálculo de `targetCoords` y `targetSize` al hook `useFocusTarget`, dejando `SolarSystemMap` exclusivamente como orquestador.
4. **Cero estilos inline en todo el proyecto.** Todos los estilos de `BodyInfoPanel`, `BodySelector`, `SolarSystemMap`, `PlanetViewer` y el icono de `SearchBar` viven en clases semánticas dentro de `src/index.css`.
5. **`astro-calc.ts` y `PlanetComparison.tsx` sin repetición.** `calculateMetrics` está partido en cuatro funciones puras pequeñas (`computePhysicalProps`, `evaluateHabitability`, `classifyPlanetAndTexture`, `buildFormattedStats`), y `PlanetComparison` genera sus filas a partir de la lista declarativa `COMPARISON_FIELDS` y el helper `formatCell`, sin repetir `'Desconocida'`.

#### Gestión de estado
6. **Patrón controlado en `SearchBar` sin `key={searchQuery}`.** Elevé `draftQuery` a `ExoplanetExplorer` junto a `searchQuery`. Así `SearchBar` es un componente controlado puro (`value` + `onChange`) que solo lanza la petición al hacer submit, y cuando el usuario pulsa un chip de `RecentSearches` se actualizan `draftQuery` y `searchQuery` a la vez sin remontar el componente ni perder el estado del nodo DOM.
7. **Por qué `selectedName` es un string pero `comparedPlanet` guarda el snapshot.** Para el planeta activo de la búsqueda actual guardo solo `selectedName` y derivo `displayPlanet` de `data`. En cambio, como vimos en clase al hablar de cuándo un dato es realmente derivable, `comparedPlanet` tiene que guardar el objeto `Exoplanet` fijado porque el usuario fija un planeta de una búsqueda (ej. «Kepler-22 b») y luego realiza otra búsqueda distinta (ej. «TRAPPIST-1 e») para compararlos entre sí; al cambiar `data` a los resultados de la nueva búsqueda, el primer planeta ya no está en `data` y no podría derivarse solo con su nombre.

#### Efectos
8. **Dependencias limpias `[url, reloads, parse]` en `useFetch`.** En lugar de reconstruir la URL cortando la clave con `indexOf(':')`, el efecto de `useFetch` depende directamente de `[url, reloads, parse]` y construye `requestKey` dentro del propio efecto.
9. **`useLocalStorage` con `initialValueRef` estable.** El efecto del listener `storage` depende únicamente de `[key]` y lee el valor por defecto desde `initialValueRef.current`, evitando re-suscribir el listener en cada render aunque se le pase un literal como `[]`.
10. **`catch` explícito en `useJplPositions` y dependencias escalares en `CameraController`.** En `useJplPositions` el `catch` distingue entre `controller.signal.aborted` y un fallo real, y `CameraController` depende de coordenadas escalares primitivas (`targetX`, `targetY`, `targetZ`).

#### Listas y condicionales
11. **Utilidad `cn` (`src/utils/cn.ts`) y keys normalizadas.** Todos los botones condicionales usan `cn(...)`, y `RecentSearches` usa `key={item.toLowerCase()}` en coordinación con `prependUniqueQuery` para evitar cualquier colisión por mayúsculas/minúsculas.

#### Originalidad y hooks reutilizables (bonus)
12. **Hooks genéricos (`useFetch<T>`, `useLocalStorage<T>`), historial persistente y comparador entre sistemas.** El explorador recuerda la última búsqueda y las 6 búsquedas recientes en `localStorage` (sincronizadas entre pestañas) y permite fijar cualquier exoplaneta para compararlo cara a cara con otro de cualquier búsqueda posterior.