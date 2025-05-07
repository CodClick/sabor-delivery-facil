
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  hasVariations?: boolean;
  variationGroups?: string[] | VariationGroup[]; // Can be either IDs or full objects
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVariations?: SelectedVariationGroup[];
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
