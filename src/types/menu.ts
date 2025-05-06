
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  hasVariations?: boolean;
  variations?: string[];
  maxVariationCount?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVariations?: SelectedVariation[];
}

export interface SelectedVariation {
  variationId: string;
  quantity: number;
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
