
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
    image: "https://villamex.com.br/wp-content/uploads/al_opt_content/IMAGE/villamex.com.br/wp-content/uploads/2023/08/NACHOS-1024x682.webp.bv_resized_mobile.webp.bv.webp",
    category: "entradas",
    popular: true,
  },
  {
    id: "2",
    name: "Festival dos Tacos",
    description: "Abacate amassado na hora com tomate, cebola, coentro, limão e especiarias. Servido com tortilhas",
    price: 19.90,
    image: "/images/FESTIVAL DOS TACOS_20250414_034829_0003.png",
    category: "entradas",
  },
  {
    id: "3",
    name: "Quesadilla de Queijo",
    description: "Tortilha de trigo recheada com queijo derretido, servida com guacamole, pico de gallo e creme azedo",
    price: 22.50,
    image: "https://villamex.com.br/wp-content/uploads/al_opt_content/IMAGE/villamex.com.br/wp-content/uploads/2023/08/Onion-Rings-1-1024x683.webp.bv_resized_mobile.webp.bv.webp",
    category: "entradas",
  },
  {
    id: "4",
    name: "Burrito de Carne",
    description: "Tortilha de trigo recheada com carne bovina temperada, arroz mexicano, feijão, queijo, alface e tomate",
    price: 32.90,
    image: "https://github.com/CodClick/sabor-delivery-facil/blob/main/public/images/burrito_de_carne.png",
    category: "principais",
    popular: true,
  },
  {
    id: "5",
    name: "Tacos de Frango",
    description: "Três tacos com tortilhas de milho, frango desfiado, pico de gallo, guacamole e coentro fresco",
    price: 29.90,
    image: "https://villamex.com.br/wp-content/uploads/al_opt_content/IMAGE/villamex.com.br/wp-content/uploads/2023/08/Burrito-1024x683.webp.bv_resized_mobile.webp.bv.webp",
    category: "principais",
  },
  {
    id: "6",
    name: "Trio Mex",
    description: "Três pratos pelo preco de 1 - 1 burrito, 1 quesadilla, 1 taco. aescolha o sabor que quiser.",
    price: 34.90,
    image: "https://villamex.com.br/wp-content/uploads/al_opt_content/IMAGE/villamex.com.br/wp-content/uploads/2023/12/QUALQUER-SABOR-5_090155-red.webp.bv_resized_mobile.webp.bv.webp",
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
