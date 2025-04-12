
import { MenuItem, Category } from "@/types/menu";

export const categories: Category[] = [
  { id: "entradas", name: "Entradas" },
  { id: "principais", name: "Pratos Principais" },
  { id: "bebidas", name: "Bebidas" },
  { id: "sobremesas", name: "Sobremesas" }
];

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Nachos Supremos",
    description: "Tortilhas crocantes cobertas com queijo derretido, guacamole, pico de gallo, creme azedo e jalapeños",
    price: 24.90,
    image: "/images/nachos.jpg",
    category: "entradas",
    popular: true,
  },
  {
    id: "2",
    name: "Guacamole Fresco",
    description: "Abacate amassado na hora com tomate, cebola, coentro, limão e especiarias. Servido com tortilhas",
    price: 19.90,
    image: "/images/guacamole.jpg",
    category: "entradas",
  },
  {
    id: "3",
    name: "Quesadilla de Queijo",
    description: "Tortilha de trigo recheada com queijo derretido, servida com guacamole, pico de gallo e creme azedo",
    price: 22.50,
    image: "/images/quesadilla.jpg",
    category: "entradas",
  },
  {
    id: "4",
    name: "Burrito de Carne",
    description: "Tortilha de trigo recheada com carne bovina temperada, arroz mexicano, feijão, queijo, alface e tomate",
    price: 32.90,
    image: "/images/burrito.jpg",
    category: "principais",
    popular: true,
  },
  {
    id: "5",
    name: "Tacos de Frango",
    description: "Três tacos com tortilhas de milho, frango desfiado, pico de gallo, guacamole e coentro fresco",
    price: 29.90,
    image: "/images/tacos.jpg",
    category: "principais",
  },
  {
    id: "6",
    name: "Enchiladas Verdes",
    description: "Tortilhas de milho recheadas com frango, cobertas com molho verde, queijo, creme azedo e cebola",
    price: 34.90,
    image: "/images/enchiladas.jpg",
    category: "principais",
  },
  {
    id: "7",
    name: "Fajitas de Carne",
    description: "Tiras de carne grelhadas com pimentões e cebola, acompanha tortilhas, guacamole, pico de gallo e creme azedo",
    price: 38.90,
    image: "/images/fajitas.jpg",
    category: "principais",
    popular: true,
  },
  {
    id: "8",
    name: "Refrigerante",
    description: "Lata 350ml. Opções: Coca-Cola, Guaraná, Sprite",
    price: 6.90,
    image: "/images/refrigerante.jpg",
    category: "bebidas",
  },
  {
    id: "9",
    name: "Suco Natural",
    description: "Copo 300ml. Opções: Laranja, Limão, Abacaxi",
    price: 8.90,
    image: "/images/suco.jpg",
    category: "bebidas",
  },
  {
    id: "10",
    name: "Água Mineral",
    description: "Garrafa 500ml",
    price: 4.50,
    image: "/images/agua.jpg",
    category: "bebidas",
  },
  {
    id: "11",
    name: "Churros Mexicanos",
    description: "Massa frita polvilhada com canela e açúcar, servida com doce de leite",
    price: 18.90,
    image: "/images/churros.jpg",
    category: "sobremesas",
    popular: true,
  },
    {
    id: "12",
    name: "Costela Prime Top",
    description: "Delicioso hambúrguer com 250g de costela de qualidade",
    price: 28.90,
    image: "/images/costela_prime.webp",
    category: "sobremesas",
  }
];

export const getMenuItemsByCategory = (categoryId: string): MenuItem[] => {
  return menuItems.filter(item => item.category === categoryId);
};

export const getPopularItems = (): MenuItem[] => {
  return menuItems.filter(item => item.popular === true);
};
