export interface ServiceItem {
  name: string;
  price: string;
  description?: string;
  duration?: string;
}

export interface ServiceCategory {
  categoryTitle: string;
  items: ServiceItem[];
}

export const SALON_SERVICES: ServiceCategory[] = [
  {
    categoryTitle: "Cuts & Styling",
    items: [
      {
        name: "Signature Dry Cut",
        price: "$95+",
        description: "Precision cut tailored to your unique style",
      },
      {
        name: "Blowout & Style",
        price: "$55",
        description: "Professional styling with premium products",
      },
      {
        name: "Event Updo",
        price: "$120",
        description: "Elegant updo for special occasions",
      },
    ],
  },
  {
    categoryTitle: "Color Artistry",
    items: [
      {
        name: "Full Balayage",
        price: "$280+",
        description: "Hand-painted highlights for natural dimension",
      },
      {
        name: "Root Touch Up",
        price: "$110",
        description: "Precise root color refresh",
      },
      {
        name: "Gloss & Toner",
        price: "$65",
        description: "Color-enhancing gloss treatment",
      },
    ],
  },
  {
    categoryTitle: "Treatments",
    items: [
      {
        name: "Keratin Complex",
        price: "$300",
        description: "Smoothing treatment for frizz-free hair",
        duration: "2-3 hours",
      },
      {
        name: "Scalp Detox",
        price: "$45",
        description: "Deep cleansing scalp treatment",
      },
    ],
  },
];



