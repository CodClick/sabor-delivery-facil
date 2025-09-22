export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  hasVariations?: boolean;
  variationGroups?: VariationGroup[]; // Now accepts only VariationGroup objects
  priceFrom?: boolean; // New property to indicate "a partir de" pricing
  tipo?: "padrao" | "pizza"; // Type of item - standard or pizza
  permiteCombinacao?: boolean; // Allow half-and-half combinations for pizzas
  maxSabores?: number; // Maximum number of flavors for combinations
  isHalfPizza?: boolean; // Indicates if this is a half pizza combination
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVariations?: SelectedVariationGroup[];
  isHalfPizza?: boolean; // Indicates if this is a half pizza combination
  combination?: {
    sabor1: { id: string; name: string };
    sabor2: { id: string; name: string };
    tamanho: "broto" | "grande";
  };
}

export interface SelectedVariationGroup {
  groupId: string;
  groupName: string;
  variations: SelectedVariation[];
}

export interface SelectedVariation {
  variationId: string;
  quantity: number;
  name?: string; // Added for displaying in cart
  additionalPrice?: number; // Added for price calculation
}

export interface Category {
  id: string;
  name: string;
  order?: number;
}

export interface Variation {
  id: string;
  name: string;
  description?: string;
  additionalPrice?: number;
  available: boolean;
  categoryIds: string[]; // Categories where this variation can be used
}

export interface VariationGroup {
  id: string;
  name: string;
  minRequired: number;
  maxAllowed: number;
  variations: string[]; // Array of variation IDs
  customMessage?: string; // Custom message for this variation group
}
