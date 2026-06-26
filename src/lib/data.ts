export type CoffeeExperience = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  accent: string;
};

export type Product = {
  id: string;
  name: string;
  variety: string;
  origin: string;
  region: string;
  farmer?: string;
  farm?: string;
  altitude?: string;
  price: number;
  weight: string;
  roast: string;
  grind: string;
  notes: string[];
  image: string;
  subscription?: boolean;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: { name: string; description?: string; price: number }[];
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
};

export const brand = {
  name: "Más Café",
  descriptor: "Nuestra historia comenzó con un café",
  tagline: "Pausa con intención",
  headline: "Aquí siempre hay algo más esperándote",
  subheadline: "Más encuentros. Más conversaciones. Más momentos que se quedan.",
  website: "https://www.mascafecol.com",
  email: "hola@mascafecol.com",
  phone: "+57 315 657 3897",
  whatsapp: "573156573897",
  address: "Calle 5B #2-38-09, Barrio San Fernando Nuevo",
  city: "Cali, Valle del Cauca, Colombia",
  social: {
    instagram: "https://instagram.com/mascafecol315",
    facebook: "https://facebook.com/mascafecol",
  },
  purpose:
    "Crear un espacio donde las personas puedan hacer una pausa consciente en medio de su día, sentirse bien atendidas y reconectar consigo mismas y con otros, a través de una experiencia de hospitalidad que va más allá del café.",
  mission:
    "Brindar una experiencia integral de hospitalidad a través del café de especialidad, la cocina y el servicio, cuidando cada detalle del espacio para que las personas puedan trabajar, compartir o simplemente desconectarse.",
  vision:
    "Convertirnos en una marca referente de hospitalidad contemporánea, reconocida por crear experiencias auténticas que combinan café, gastronomía y espacio.",
  values: [
    {
      title: "Hospitalidad genuina",
      text: "Ponemos a las personas en el centro. Cuidamos cada interacción para que quienes nos visitan se sientan bien atendidos y valorados.",
    },
    {
      title: "Intención en los detalles",
      text: "Desde el servicio hasta el ambiente, cada decisión busca generar bienestar, pausa y conexión.",
    },
    {
      title: "Trabajo en equipo",
      text: "Somos un equipo que se apoya y crece junto. La colaboración es la base de una experiencia coherente.",
    },
    {
      title: "Crecimiento consciente",
      text: "Apostamos por la mejora continua del equipo, del servicio y de la experiencia, de manera sostenible y humana.",
    },
  ],
};

export const experiences: CoffeeExperience[] = [
  {
    id: "pausa",
    title: "Pausa",
    subtitle: "Con intención",
    description:
      "Un espacio donde el tiempo baja, el ruido desaparece y cada elemento respira. Acompañamos sin saturar.",
    image: "/images/brand/pausa.png",
    accent: "bg-blue-deep",
  },
  {
    id: "carta",
    title: "Carta",
    subtitle: "Café de especialidad",
    description:
      "Microlotes colombianos con trazabilidad completa. Cada taza cuenta la historia de su origen y su productor.",
    image: "/images/brand/carta.png",
    accent: "bg-brown-dark",
  },
  {
    id: "horno",
    title: "Horno",
    subtitle: "Gastronomía cuidada",
    description:
      "Desayunos, brunch y repostería pensados para acompañar cada momento del día con calidez y sabor.",
    image: "/images/brand/horno.png",
    accent: "bg-brown-light",
  },
  {
    id: "visita",
    title: "Visita",
    subtitle: "Un espacio para quedarse",
    description:
      "Diseñado para trabajar, compartir o desconectarse. Hospitalidad consciente en cada rincón.",
    image: "/images/brand/visita.png",
    accent: "bg-green",
  },
];

export const products: Product[] = [
  {
    id: "caturra-colombia",
    name: "Caturra Colombia",
    variety: "Caturra",
    origin: "La Unión, Nariño",
    region: "Nariño",
    farmer: "Fda. Reyes Burbano",
    farm: "Ojo de agua",
    altitude: "1900 msnm",
    price: 45000,
    weight: "250 g",
    roast: "Tostión media",
    grind: "Molido / Grano",
    notes: ["Caramelo", "Mandarina", "Caña de azúcar", "Nibs de cacao"],
    image: "/images/products/caja-cafe.png",
    subscription: true,
  },
  {
    id: "origen-huila",
    name: "Origen Huila",
    variety: "Castillo",
    origin: "Pitalito",
    region: "Huila",
    price: 42000,
    weight: "250 g",
    roast: "Tostión media",
    grind: "Grano",
    notes: ["Chocolate", "Nuez", "Dulce"],
    image: "/images/products/caja-cafe.png",
    subscription: true,
  },
  {
    id: "microlote-natural",
    name: "Microlote Natural",
    variety: "Geisha",
    origin: "Santa Isabel",
    region: "Tolima",
    price: 68000,
    weight: "250 g",
    roast: "Tostión clara",
    grind: "Grano",
    notes: ["Floral", "Bergamota", "Frutal"],
    image: "/images/products/caja-cafe.png",
  },
  {
    id: "kit-regalo",
    name: "Kit Tres Orígenes",
    variety: "Variedad",
    origin: "Productores aliados",
    region: "Colombia",
    price: 115000,
    weight: "3 × 250 g",
    roast: "Tostión media",
    grind: "Grano",
    notes: ["Regalo", "Variedad", "15% dto."],
    image: "/images/products/caja-cafe.png",
  },
];

export const menuCategories: MenuCategory[] = [
  {
    id: "cafe",
    name: "Café de especialidad",
    items: [
      { name: "Espresso", price: 6500 },
      { name: "Americano", price: 7000 },
      { name: "Capuchino", price: 9500 },
      { name: "Latte", price: 10000 },
      { name: "Flat white", price: 10500 },
      { name: "Pour over", description: "Origen del día", price: 12000 },
      { name: "Cold brew", price: 11000 },
    ],
  },
  {
    id: "desayuno",
    name: "Desayuno & brunch",
    items: [
      {
        name: "Tostada de aguacate",
        description: "Pan artesanal, aguacate, huevo poché",
        price: 22000,
      },
      {
        name: "Bowl de frutas",
        description: "Yogurt griego, granola, frutas de temporada",
        price: 18000,
      },
      {
        name: "Tostadas francesas",
        description: "Miel, frutos rojos, crema",
        price: 20000,
      },
      {
        name: "Sándwich club",
        description: "Pollo, tocino, queso cheddar",
        price: 24000,
      },
    ],
  },
  {
    id: "reposteria",
    name: "Repostería",
    items: [
      { name: "Croissant de chocolate", price: 9000 },
      { name: "Croissant de almendras", price: 10000 },
      { name: "Pastel de coco y limón", price: 12000 },
      { name: "Waffle belga", price: 14000 },
    ],
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "pausa-intencion",
    title: "¿Qué significa pausar con intención?",
    excerpt:
      "En Más Café creemos que cada taza es una oportunidad para detenerse, conectar y disfrutar el momento.",
    date: "26 jun 2025",
    category: "Marca",
    image: "/images/brand/mood.png",
  },
  {
    id: "preparar-casa",
    title: "Prepáralo en casa, a tu manera",
    excerpt:
      "Guía para disfrutar nuestro café en cafetera de goteo, prensa francesa o pour over.",
    date: "15 may 2025",
    category: "Barismo",
    image: "/images/products/caja-cafe.png",
  },
  {
    id: "origen-narino",
    title: "Conoce el origen: Ojo de agua, Nariño",
    excerpt:
      "La historia de Fda. Reyes Burbano y el microlote Caturra que llega a tu taza.",
    date: "3 abr 2025",
    category: "Origen",
    image: "/images/hero/illustration.png",
  },
  {
    id: "cafe-fresco",
    title: "Por qué el café fresco importa",
    excerpt:
      "Los cafés extraordinarios deben ser absolutamente frescos. Te contamos cómo lo garantizamos.",
    date: "11 feb 2025",
    category: "Calidad",
    image: "/images/brand/carta.png",
  },
];

export function formatPrice(cop: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(cop);
}
