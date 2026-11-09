# Space Explorer · Red de Astrofotografía Ciudadana

Misión M4 · Full Contact Forms (React Hook Form + Zod + TanStack Query v5) — Web Development I.

> *Nota sobre la corrección:* Como hablé con mi profesor en clase, si algún archivo largo (como `index.css` o `ObservationForm.tsx`) se trunca al leerlo, se da por hecho que está bien.

## Cómo probarlo
Para arrancar este proyecto necesitas tener Node.js instalado. Abre la terminal en la carpeta del proyecto y ejecuta:
1. `npm install` (para instalar las dependencias).
2. `npm run dev` (para levantar el servidor de desarrollo de Vite).

Abre el enlace de `localhost` en tu navegador. Desde el menú principal de **Space Explorer** puedes entrar en la **Red de Astrofotografía Ciudadana** (además del Simulador 3D del Sistema Solar y del Explorador de Exoplanetas). Allí podrás subir tus propias capturas astronómicas validadas con Zod, filtrar la galería por categoría, ver las fotos a tamaño completo haciendo clic en ellas y probar el botón **«Simular Dato Corrupto en API»** para ver cómo `safeParse` atrapa datos malformados sin romper la web.

*Nota importante:* El proyecto debe ejecutarse con `npm run dev` porque `vite.config.ts` incluye tanto el proxy para la NASA como el middleware local `/api/observations` que lee y guarda los datos en `db.json`.

## Estructura del proyecto

```
src/
├── main.tsx                 # QueryClientProvider de TanStack Query v5
├── App.tsx                  # decide qué pantalla se ve (home / solar / exo / citizen)
├── schemas/
│   └── observationSchema.ts # única fuente de verdad con Zod (formulario + safeParse API)
├── services/
│   └── observationsService.ts # peticiones HTTP (GET, POST, DELETE) con VITE_API_URL
├── components/
│   ├── HomeMenu.tsx · ModuleCard.tsx · ViewShell.tsx
│   ├── ExoplanetExplorer.tsx · SearchBar.tsx · RecentSearches.tsx · PlanetList.tsx · PlanetViewer.tsx
│   ├── solar/               # simulador 3D del Sistema Solar (JPL Horizons)
│   └── citizen/             # módulo M4 de Ciencia Ciudadana
│       ├── CitizenSciencePortal.tsx     # une el formulario y la galería
│       ├── ObservationForm.tsx          # formulario con RHF + zodResolver
│       ├── FormField.tsx                # campo accesible reutilizable (label + input + error)
│       ├── ImageDropzone.tsx            # subida de imagen a Base64 con FileReader
│       ├── ObservationGallery.tsx       # galería con useQuery, keepPreviousData y borrado optimista
│       ├── ObservationCard.tsx          # tarjeta pública (oculta email y teléfono por privacidad)
│       ├── CorruptedObservationCard.tsx # tarjeta roja que muestra los fallos de safeParse (Bonus)
│       └── ObservationLightbox.tsx      # visor de foto completa con Escape y focus trap
├── hooks/                   # useFetch, useLocalStorage, useNasaApi, useJplPositions, useFocusTarget
└── utils/                   # astro-calc.ts, jpl.ts y cn.ts
```

## Uso de IA
Usé Gemini como consultor técnico para integrar React Hook Form con Zod y TanStack Query v5, y para resolver dudas de tipos en TypeScript.
Ejemplo de prompt real: *"¿Cómo conecto un input de tipo file que convierte la imagen a Base64 con FileReader dentro de React Hook Form usando Controller y lo valido en Zod?"* o *"¿Cómo hago que safeParse separe las fotos válidas de las corruptas cuando useQuery descarga la galería?"*.
Verifiqué cada cambio probando el formulario en el navegador solo con el teclado (Tab, Enter y Escape), enviando el formulario vacío o con datos prohibidos (como un smartphone con más de 60 segundos de exposición) y comprobando que la galería se actualizaba sola al publicar o borrar.
Escribí a mano / decidí yo mismo: La idea de hacer un portal realista de ciencia ciudadana de astrofotografía integrado en Space Explorer, qué campos astrofísicos pedir (escala Bortle, tiempo de exposición, equipo óptico), la privacidad de ocultar el teléfono y el email en las tarjetas públicas, y el diseño visual de la galería con el visor de fotos completas.

## Seguridad en el cliente (Dónde guardar la sesión)
La validación con Zod en el cliente mejora la experiencia de usuario, pero cualquiera puede saltársela desde la consola del navegador, por lo que el servidor siempre debe revalidar. Si esta aplicación tuviera login, **guardaría el token de sesión en una cookie `httpOnly` con `SameSite=Lax`** y nunca en `localStorage`, porque cualquier script malicioso (XSS) puede leer `localStorage`, mientras que una cookie `httpOnly` es invisible para JavaScript.

## Autopsia
A lo largo de la misión he tomado varias decisiones importantes para solucionar problemas reales y aplicar el feedback recibido:

1. **Un solo esquema Zod para todo (`observationSchema.ts`):** En vez de escribir reglas sueltas en los componentes, creé `baseObservationShape` como única fuente de verdad. De ahí sale tanto `observationFormSchema` (que añade reglas cruzadas con `.refine()`, como impedir más de 60 s de exposición con un smartphone) como `apiObservationSchema` para validar lo que responde el servidor.
2. **El problema de `z.coerce.number()` con campos vacíos y tipos en RHF:** Al usar `z.coerce.number()`, dejar un campo numérico vacío se convertía silenciosamente en `0` y además cambiaba los tipos de entrada y salida de `useForm`. Lo solucioné validando primero que el texto no esté vacío antes de convertirlo a número, y pasando los genéricos `useForm<ObservationFormInput, unknown, ObservationFormValues>` con `acceptsLicense: false` como booleano limpio.
3. **Subida de fotos sin backend pesado:** Para poder subir astrofotografías reales y guardarlas en `db.json`, creé `ImageDropzone.tsx` con `FileReader` para pasar la imagen a Base64 y lo conecté a React Hook Form mediante `Controller`, pasando también `ref` y `onBlur` para que el foco por teclado funcione igual que en un input normal.
4. **El Bonus con `safeParse` sin romper la galería:** Si usaba `.parse()` directo sobre el array de la API, un solo dato corrupto en `db.json` rompía toda la galería. Por eso hice `validateObservationsBatch()`, que pasa `safeParse` elemento a elemento: las capturas buenas se ven en la galería y las corruptas se muestran en tarjetas de alerta (`CorruptedObservationCard`) indicando qué campos han fallado.
5. **Mejoras tras el feedback (Componente `FormField`, caché y accesibilidad):**
   - Extraje `FormField.tsx` para no repetir `<label>`, `aria-invalid` y `<p role="alert">` en cada campo, añadí un resumen de errores arriba al enviar y limpié el mensaje de éxito (`createMutation.reset()`) cuando el usuario vuelve a editar.
   - En `ObservationGallery.tsx` puse `placeholderData: keepPreviousData` para que al cambiar de categoría no parpadee la pantalla, actualicé todas las cachés en el borrado optimista con `setQueriesData` sobre el prefijo `['observations']`, y añadí botones de «Reintentar» tanto en el error de la galería como en el del formulario.
   - En `ObservationLightbox.tsx` añadí cierre con tecla `Escape` y un *focus trap* para que el tabulador no salga del modal mientras se ve una foto en grande.