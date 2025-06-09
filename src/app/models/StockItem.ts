export interface StockItem {
    id: number;
    reference: string;           // Référence du produit
    designation: string;         // Nom/Description du produit
    category: StockCategory;     // Catégorie (Alarme, CCTV, Incendie, Contrôle d'accès)
    quantity: number;            // Quantité en stock
    minQuantity: number;         // Seuil d'alerte minimum
    unit: string;               // Unité (pièce, mètre, etc.)
    location?: string;          // Emplacement dans la camionnette
    lastModified: Date;         // Dernière modification du stock
    price?: number;             // Prix unitaire (optionnel)
}

export enum StockCategory {
    ALARM = 'Alarme',
    CCTV = 'Vidéosurveillance',
    FIRE = 'Incendie',
    ACCESS = 'Contrôle d\'accès',
    CABLE = 'Câblage',
    TOOLS = 'Outillage',
    OTHER = 'Autre'
} 