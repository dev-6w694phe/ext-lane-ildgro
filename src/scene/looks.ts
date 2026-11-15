// Original block-avatar outfits. Colours are plain hex so they are easy to restyle.
export type Hair = "bacon" | "messy" | "slick" | "spiky" | "bob" | "bun" | "cap" | "tophat" | "none";
export type Accessory = "crown" | "shades" | "chain" | "headphones" | "bow" | "scarf" | "jacket" | "hoodie" | "stripe";

export type Look = {
  skin: string;
  shirt: string;
  pants: string;
  shoes: string;
  hair: Hair;
  hairColor: string;
  accessories: Accessory[];
  /** secondary outfit colour (jacket lapels, hoodie pocket, stripe) */
  trim?: string;
};

export const PIP: Look = {
  skin: "#f6c99a", shirt: "#3fa34d", pants: "#3a5fb5", shoes: "#2b2b33", hair: "bacon", hairColor: "#8a3f1d",
  accessories: ["stripe"], trim: "#2f7c39",
};
export const GOLDIE: Look = {
  skin: "#e7b98d", shirt: "#6b2fb3", pants: "#2a1d4a", shoes: "#111111", hair: "slick", hairColor: "#1b1b22",
  accessories: ["crown", "shades", "chain", "jacket"], trim: "#ffd23f",
};
export const JUNO: Look = {
  skin: "#c98d5e", shirt: "#1fb9a3", pants: "#43465a", shoes: "#f2f2f2", hair: "messy", hairColor: "#e8762c",
  accessories: ["hoodie", "headphones"], trim: "#178f7e",
};

/** VIP crowd: flashy, all different */
export const VIPS: Look[] = [
  { skin: "#f1c27d", shirt: "#e83f6f", pants: "#2b2b44", shoes: "#111", hair: "spiky", hairColor: "#ffd23f", accessories: ["shades", "chain"], trim: "#ffffff" },
  { skin: "#8d5524", shirt: "#ffd23f", pants: "#30304a", shoes: "#fff", hair: "bun", hairColor: "#1b1b22", accessories: ["bow", "jacket"], trim: "#e83f6f" },
  { skin: "#ffdbac", shirt: "#3a86ff", pants: "#1b263b", shoes: "#111", hair: "tophat", hairColor: "#111111", accessories: ["chain"], trim: "#ffd23f" },
  { skin: "#c68642", shirt: "#ff7b00", pants: "#2d2d2d", shoes: "#111", hair: "cap", hairColor: "#111111", accessories: ["shades", "chain"], trim: "#ffd23f" },
  { skin: "#f6d2b0", shirt: "#9b5de5", pants: "#22223b", shoes: "#fff", hair: "bob", hairColor: "#ff5d8f", accessories: ["jacket"], trim: "#f15bb5" },
  { skin: "#e0ac69", shirt: "#00bbf9", pants: "#14213d", shoes: "#111", hair: "spiky", hairColor: "#9b5de5", accessories: ["shades"], trim: "#ffffff" },
  { skin: "#a86b3c", shirt: "#f15bb5", pants: "#2b2d42", shoes: "#111", hair: "bob", hairColor: "#ffd23f", accessories: ["chain", "jacket"], trim: "#ffd23f" },
  { skin: "#ffe0bd", shirt: "#06d6a0", pants: "#1d3557", shoes: "#111", hair: "tophat", hairColor: "#ffd23f", accessories: ["bow"], trim: "#ffd23f" },
];

/** Newcomers that walk in once the doors open: simple starter outfits */
export const GUESTS: Look[] = [
  { skin: "#f6c99a", shirt: "#d64545", pants: "#3a5fb5", shoes: "#2b2b33", hair: "bacon", hairColor: "#5b2a14", accessories: [], trim: "#a83232" },
  { skin: "#c98d5e", shirt: "#4a90d9", pants: "#2f3e46", shoes: "#2b2b33", hair: "none", hairColor: "#000", accessories: [], trim: "#3a73ad" },
  { skin: "#ffdbac", shirt: "#f4a259", pants: "#5c6b73", shoes: "#2b2b33", hair: "bun", hairColor: "#a0522d", accessories: [], trim: "#c47f3f" },
  { skin: "#8d5524", shirt: "#8bc34a", pants: "#3a5fb5", shoes: "#2b2b33", hair: "cap", hairColor: "#d64545", accessories: [], trim: "#6a9a35" },
];
