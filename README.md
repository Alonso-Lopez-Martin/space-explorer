# Space Explorer · M4 · Full Contact Forms («Valida o muere»)

Misión M4 · Formularios y peticiones HTTP (React 19 + TypeScript + React Hook Form + Zod + TanStack Query v5) — Web Development I.

## Cómo probarlo
Para arrancar este proyecto necesitas tener Node.js instalado. Abre la terminal en la carpeta del proyecto y ejecuta:
1. `npm install` (para instalar las dependencias: `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-query`, Three.js y React Three Fiber).
2. `npm run dev` (para levantar el servidor de desarrollo local de Vite).

Abre el enlace de `localhost` indicado en tu navegador. Desde la pantalla de inicio («Space Explorer»), encontrarás los tres módulos integrados del ecosistema espacial:
- **Red de Astrofotografía Ciudadana (Misión M4):** Portal donde astrónomos aficionados registran capturas de eventos astronómicos validadas en cliente con **React Hook Form + Zod** y sincronizadas con un API REST persistente (`db.json`) mediante **TanStack Query v5** (`useQuery`, `useMutation` e invalidación automática de caché). Incluye inspección de fotografías a tamaño completo (Lightbox) y demostración en vivo del **Bonus de validación de respuestas del API con `safeParse`**.
- **Simulador 3D Interactivo del Sistema Solar (JPL Horizons)** y **Explorador de Exoplanetas (NASA Archive)** de la misión anterior integrados en la misma plataforma.

*Nota sobre la API y variables de entorno:* El proyecto lee la URL base desde `.env` (`VITE_API_URL=/api/observations`) y utiliza un middleware integrado en `vite.config.ts` que sirve y persiste los cambios (`GET`, `POST`, `DELETE`) sobre el archivo `db.json` de la raíz sin necesidad de levantar un segundo terminal ni sufrir bloqueos de CORS.

## Estructura del proyecto
```
src/
├── App.tsx                                # Enrutador principal de vistas (home / solar / exo / citizen)
├── main.tsx                               # Configuración global de QueryClientProvider (TanStack Query v5)
├── schemas/
│   └── observationSchema.ts               # Única fuente de verdad Zod (formulario, API y Bonus safeParse)
├── services/
│   └── observationsService.ts             # Capa de servicios HTTP (GET, POST, DELETE) con VITE_API_URL
├── components/
│   ├── citizen/                           # Módulo M4 · Red de Astrofotografía Ciudadana
│   │   ├── CitizenSciencePortal.tsx       # Orquestador del formulario y la galería remota
│   │   ├── ObservationForm.tsx            # Formulario no controlado (RHF + zodResolver + useMutation)
│   │   ├── ImageDropzone.tsx              # Subida de imagen (FileReader Base64) conectada vía Controller
│   │   ├── ObservationGallery.tsx         # Listado con useQuery, filtro por categoría y modal Lightbox
│   │   ├── ObservationCard.tsx            # Tarjeta pública de observación (filtra email/teléfono privados)
│   │   └── CorruptedObservationCard.tsx   # Tarjeta de alerta que muestra los datos corruptos atrapados por Zod
│   ├── HomeMenu.tsx · ModuleCard.tsx · ViewShell.tsx
│   ├── ExoplanetExplorer.tsx · SearchBar.tsx · RecentSearches.tsx · PlanetList.tsx · PlanetViewer.tsx
│   └── solar/                             # Simulador 3D del Sistema Solar (React Three Fiber)
├── hooks/
│   ├── useFetch.ts · useLocalStorage.ts · useNasaApi.ts · useJplPositions.ts · useFocusTarget.ts
└── utils/
    ├── astro-calc.ts · jpl.ts · cn.ts
```

## Arquitectura de la Misión M4

### 1. React Hook Form y Accesibilidad (EAA / WAI-ARIA)
- **Inputs no controlados y `Controller`:** `ObservationForm.tsx` registra todos los campos HTML nativos con `{...register('campo')}` para evitar re-renders en cada pulsación de tecla, y emplea `<Controller>` únicamente para conectar el selector de archivos personalizado (`ImageDropzone.tsx`).
- **Accesibilidad completa:**
  - Todos los campos tienen su etiqueta `<label htmlFor="...">` explícita (nunca se usa el `placeholder` como sustituto de etiqueta) y atributos `autoComplete` pertinentes (`given-name`, `family-name`, `email`, `tel`, `country-name`).
  - Los bloques temáticos del formulario están agrupados semánticamente con `<fieldset>` y `<legend>`.
  - Cada campo expone `aria-invalid={Boolean(errors.campo)}` y `aria-describedby` apuntando al `id` de su mensaje de error (`role="alert"`).
  - El botón de envío nunca se bloquea en vacío: permite enviar con el teclado (`Enter`), activa `shouldFocusError: true` para llevar el foco automáticamente al primer campo inválido y solo se deshabilita (`disabled={createMutation.isPending}`) mientras la petición `POST` está en vuelo para evitar dobles envíos.
  - Los estados globales de envío y carga se anuncian mediante regiones vivas `role="status"` (éxito/carga) y `role="alert"` (error de servidor).

### 2. Esquema Zod como única fuente de verdad (`src/schemas/observationSchema.ts`)
- **Coerción y reglas expresivas:** Uso de `z.email()`, `z.coerce.number()` para transformar los strings numéricos del DOM (`exposureSeconds`, `bortleScale`), `z.enum()` para categorías y equipo óptico, validación de fecha ISO pasada/presente y `z.literal(true)` para la cesión de licencia científica.
- **Validaciones cruzadas con `.refine()`:**
  1. Un smartphone sin seguimiento ecuatorial no admite tiempos de exposición superiores a 60 segundos.
  2. Un objeto de cielo profundo fotografiado desde un cielo urbano contaminado (`bortleScale > 7`) exige al menos 30 segundos de exposición.
- ** ★ BONUS — Validación de respuestas del API con `safeParse`:**
  - En lugar de confiar ciegamente en lo que devuelve `GET /api/observations`, `validateObservationsBatch()` pasa cada elemento por `apiObservationSchema.safeParse(item)`.
  - `db.json` incluye un registro corrupto (`obs-corrupt-999` con exposición `-45`, escala Bortle `99`, fecha no ISO y email sin `@`), además de un botón **«Simular Dato Corrupto en API»** en la galería. `safeParse` atrapa el registro defectuoso sin romper la interfaz y `CorruptedObservationCard` muestra la lista exacta de violaciones detectadas por Zod, permitiendo purgarlo del servidor con `DELETE`.

### 3. TanStack Query v5 y Capa de Servicios (`src/services/observationsService.ts`)
- **Separación de responsabilidades:** Los componentes no llaman a `fetch` directamente; delegan en `observationsService.ts`, que comprueba siempre `response.ok` y lanza errores descriptivos con el código HTTP.
- **`useQuery` y `useMutation`:** La galería se suscribe a `queryKey: ['observations']`. Al crear una observación o eliminar/inyectar un registro con `useMutation`, el callback `onSuccess` ejecuta `queryClient.invalidateQueries({ queryKey: ['observations'] })` (además de `reset()` en el formulario), refrescando la galería en segundo plano de forma automática.

### 4. Seguridad en el cliente y Privacidad
- **Privacidad por diseño:** Aunque el formulario valida el correo electrónico y el teléfono del observador para trazabilidad científica, `ObservationCard` jamás renderiza esos campos en la galería pública.
- **Prevención de XSS y gestión de sesión:** Todos los datos de usuario se interpolan a través de JSX (escapado automático sin usar `dangerouslySetInnerHTML`). Si la aplicación incorporara autenticación de usuarios, el token o identificador de sesión se almacenaría exclusivamente en una **cookie `httpOnly` con `SameSite=Lax`** gestionada por el servidor, y nunca en `localStorage`, evitando que un eventual script malicioso (XSS) o una dependencia comprometida pudiera leerlo desde JavaScript.

## Uso de IA
Usé Gemini como pareja de programación y consultor técnico para estructurar la integración de React Hook Form, Zod 4 y TanStack Query v5 dentro de nuestro proyecto Space Explorer.
Ejemplo de prompt real: *"Diseña un esquema Zod que sea la única fuente de verdad tanto para un formulario de astrofotografía ciudadana en React Hook Form (con z.coerce.number y validaciones cruzadas .refine) como para validar el array devuelto por la API usando safeParse sin romper la galería si llega un registro corrupto"*.
Verifiqué cada archivo comprobando que `npm run lint` y `npm run build` compilaran sin errores en TypeScript estricto, recorriendo el formulario completo únicamente con el teclado (`Tab`, `Space`, `Enter`) y forzando datos corruptos en `db.json` para verificar que `safeParse` los interceptaba en pantalla.
Escribí y diseñé mi propia idea de negocio (el portal de Ciencia Ciudadana inspirado en proyectos reales de observación astronómica), la selección de metadatos astrofísicos (escala de cielo Bortle, tiempo de integración, equipo óptico), la privacidad de datos personales en las tarjetas, la disposición horizontal de las tarjetas con fotografía de portada y el visor modal a tamaño completo (Lightbox).

## Autopsia
1. **Divergencia de tipos de entrada y salida con `z.coerce.number()` en TypeScript:** Al conectar `observationFormSchema` con `zodResolver(observationFormSchema)`, tipar manualmente el segundo callback de `handleSubmit` provocaba un conflicto en TypeScript porque `z.coerce.number()` hace que el tipo de entrada del esquema (`unknown` procedente del input del DOM) difiera del tipo de salida (`number` ya validado). Descarté forzar casts manuales con `as` y dejé que `useForm({ resolver: zodResolver(observationFormSchema), shouldFocusError: true })` infiriera automáticamente los tipos de entrada y salida desde el resolver, delegando también el enfoque automático del primer campo con error en `shouldFocusError`.
2. **Subida de imágenes sin backend binario externo:** Quería que el usuario pudiera subir astrofotografías reales desde su disco duro y verlas inmediatamente en la galería persistida en `db.json`. Descarté depender de servicios externos en la nube (que requerirían claves privadas o fallarían sin configuración) y construí el componente `ImageDropzone` con la API nativa `FileReader` que valida el tipo MIME y el peso máximo (4 MB) antes de codificar la captura en Base64 (`data:image/...`), integrándolo en React Hook Form mediante `<Controller>`.
3. **Aislamiento de registros corruptos con `safeParse` en vez de `.parse()`:** Si usáramos `z.array(apiObservationSchema).parse(json)` directamente en la `queryFn`, un único registro corrupto en la base de datos tumbaría toda la galería y dejaría al usuario con una pantalla de error general (`isError = true`). En su lugar, diseñé `validateObservationsBatch` iterando con `safeParse` elemento a elemento: así las fotografías válidas se siguen mostrando con normalidad y los registros dañados se aíslan en tarjetas de diagnóstico (`CorruptedObservationCard`) que explican qué regla de Zod falló y permiten purgarlos del servidor.