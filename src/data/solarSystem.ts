// Datos estáticos del Sistema Solar: se separan de la escena para que los
// componentes 3D solo se ocupen de dibujar y animar.

export const SOLAR_SCALE = 75; // unidades de escena por UA

export interface MoonData {
  name: string;
  size: number;
  distance: number;
  speed: number;
  texture: string;
  type: string;
  description: string;
}

export interface PlanetData {
  id: string;
  name: string;
  size: number;
  texture: string;
  type: string;
  color: string;
  description: string;
  moons: MoonData[];
  tint?: string; // color que multiplica la textura cuando se reutiliza una ajena
}

// Sobre las texturas:
// - Mercurio y la Luna usan '/Pluto_Charon.jpg' porque en la biblioteca de
//   imágenes de la NASA no había un mapa descargable (render ni textura) de
//   ninguno de los dos. Charon es una superficie gris y craterizada, así que
//   encaja visualmente. Esta sustitución está hablada y aceptada con el profesor.
// - Urano tampoco tenía textura propia disponible: reutiliza la de Neptuno y
//   se le aplica un `tint` (usado como emisivo) para darle su característico
//   tono azul clarito/pálido y diferenciarlo del azul profundo de Neptuno.
export const planetsData: PlanetData[] = [
  { 
    id: '199', name: 'Mercurio', size: 2.4, texture: '/Pluto_Charon.jpg', type: 'Planeta Rocoso', color: '#a8a8a8',
    description: 'El planeta más cercano al Sol y el más pequeño del sistema solar interior.',
    moons: [] 
  },
  { 
    id: '299', name: 'Venus', size: 3.5, texture: '/Venus.jpg', type: 'Planeta Rocoso', color: '#e3bb76',
    description: 'Un mundo abrasador cubierto por una densa atmósfera con efecto invernadero extremo.',
    moons: [] 
  },
  { 
    id: '399', name: 'Tierra', size: 3.8, texture: '/Earth.jpg', type: 'Planeta Rocoso', color: '#00d2ff',
    description: 'Nuestro hogar, el único mundo conocido con océanos de agua líquida en la superficie y vida.',
    moons: [
      { name: 'Luna', size: 0.9, distance: 8, speed: 0.01, texture: '/Pluto_Charon.jpg', type: 'Satélite Natural', description: 'El único satélite natural de la Tierra.' }
    ] 
  },
  { 
    id: '499', name: 'Marte', size: 2.8, texture: '/Mars.jpg', type: 'Planeta Rocoso', color: '#ff5733',
    description: 'El Planeta Rojo, hogar del Monte Olimpo y antiguos lechos fluviales secos.',
    moons: [
      { name: 'Fobos', size: 0.5, distance: 6.0, speed: 0.02, texture: '/Mars_Phobos.jpg', type: 'Satélite Irregular', description: 'La mayor y más cercana de las dos lunas de Marte.' },
      { name: 'Deimos', size: 0.3, distance: 8.5, speed: 0.015, texture: '/Mars_Deimos.jpg', type: 'Satélite Pequeño', description: 'La más pequeña y externa de las lunas marcianas.' }
    ]
  },
  { 
    id: '599', name: 'Júpiter', size: 8.5, texture: '/Jupiter.jpg', type: 'Gigante Gaseoso', color: '#d4a373',
    description: 'El planeta más grande del sistema solar, más del doble de masivo que todos los demás juntos.',
    moons: [
      { name: 'Ío', size: 1.0, distance: 14, speed: 0.018, texture: '/Jupiter_Io(B).jpg', type: 'Satélite Volcánico', description: 'El cuerpo con mayor actividad volcánica del sistema solar.' },
      { name: 'Europa', size: 0.9, distance: 18, speed: 0.014, texture: '/Jupiter_Europa.jpg', type: 'Satélite Helado', description: 'Alberga un vasto océano de agua salada bajo su corteza de hielo.' },
      { name: 'Ganímedes', size: 1.4, distance: 23, speed: 0.01, texture: '/Jupiter_Ganymede.jpg', type: 'Satélite', description: 'La luna más grande del sistema solar, incluso mayor que Mercurio.' },
      { name: 'Calisto', size: 1.2, distance: 28, speed: 0.007, texture: '/Jupiter_Callisto.jpg', type: 'Satélite Craterizado', description: 'Uno de los paisajes con más cráteres y antiguos del sistema solar.' }
    ]
  },
  { 
    id: '699', name: 'Saturno', size: 7.2, texture: '/Saturn.jpg', type: 'Gigante Gaseoso', color: '#f4d58d',
    description: 'Rodeado por un complejo sistema de anillos de hielo y roca, y decenas de lunas.',
    moons: [
      { name: 'Titán', size: 1.3, distance: 15, speed: 0.01, texture: '/Saturn_Titan.jpg', type: 'Satélite con atmósfera', description: 'La única luna con una atmósfera densa y lagos de metano líquido.' },
      { name: 'Dione', size: 0.6, distance: 19, speed: 0.012, texture: '/Saturn_Dione.jpg', type: 'Satélite Helado', description: 'Luna interior de Saturno con grandes acantilados de hielo.' },
      { name: 'Encélado', size: 0.5, distance: 22, speed: 0.015, texture: '/Saturn_Enceladus.jpg', type: 'Satélite Activo', description: 'Emite géiseres de agua al espacio desde su polo sur.' },
      { name: 'Jápeto', size: 0.7, distance: 25, speed: 0.008, texture: '/Saturn_Lapetus.jpg', type: 'Satélite Bicolor', description: 'Famoso por su llamativa coloración en dos tonos contrastados.' },
      { name: 'Mimas', size: 0.4, distance: 12, speed: 0.018, texture: '/Saturn_Mimas.jpg', type: 'Satélite Craterizado', description: 'Destaca por el gigantesco cráter Herschel que le da aspecto similar a la Estrella de la Muerte.' },
      { name: 'Rea', size: 0.8, distance: 28, speed: 0.007, texture: '/Saturn_Rhea.jpg', type: 'Satélite Helado', description: 'La segunda luna más grande de Saturno con tenue atmósfera de oxígeno.' },
      { name: 'Tetis', size: 0.65, distance: 16, speed: 0.013, texture: '/Saturn_Tethys.jpg', type: 'Satélite Helado', description: 'Posee un enorme cañón llamado Ithaca Chasma.' }
    ]
  },
  { 
    id: '799', name: 'Urano', size: 5.0, texture: '/Neptune.jpg', tint: '#4488aa', type: 'Gigante de Hielo', color: '#73d2de',
    description: 'Un gigante de hielo único que rota prácticamente de lado respecto a su plano orbital.',
    moons: [
      { name: 'Ariel', size: 0.5, distance: 12, speed: 0.014, texture: '/Uranus_Ariel.jpg', type: 'Satélite', description: 'La más brillante y joven de las lunas de Urano.' },
      { name: 'Miranda', size: 0.4, distance: 10, speed: 0.018, texture: '/Uranus_Miranda.jpg', type: 'Satélite Geológico', description: 'Posee cañones y acantilados extremos de hasta 20 km de altura.' },
      { name: 'Oberón', size: 0.6, distance: 20, speed: 0.008, texture: '/Uranus_Oberon.jpg', type: 'Satélite Exterior', description: 'La segunda luna más grande de Urano, muy craterizada.' },
      { name: 'Titania', size: 0.65, distance: 16, speed: 0.01, texture: '/Uranus_Titania.jpg', type: 'Satélite Mayor', description: 'La mayor de las lunas de Urano.' },
      { name: 'Umbriel', size: 0.55, distance: 14, speed: 0.012, texture: '/Uranus_Umbriel.jpg', type: 'Satélite Oscuro', description: 'La más oscura de las grandes lunas uranianas.' }
    ] 
  },
  { 
    id: '899', name: 'Neptuno', size: 4.8, texture: '/Neptune.jpg', type: 'Gigante de Hielo', color: '#4361ee',
    description: 'El planeta más lejano, oscuro, frío y azotado por vientos supersónicos.',
    moons: [] 
  }
];

export const fallbackAU: Record<string, number> = {
  '199': 0.39, '299': 0.72, '399': 1.0, '499': 1.52, '599': 5.2, '699': 9.5, '799': 19.2, '899': 30.1
};
