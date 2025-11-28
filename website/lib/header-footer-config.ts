import layoutDesign from "@/header-and-footer-design.json";
import type { HeaderFooterDesign } from "@/types/header-footer";

export const headerFooterConfig = layoutDesign as HeaderFooterDesign;
export const headerConfig = headerFooterConfig.header;
export const footerConfig = headerFooterConfig.footer;
export const layoutColorPalette = headerFooterConfig.colorPalette;
export const layoutTypography = headerFooterConfig.typography;
export const layoutAnimations = headerFooterConfig.animations;
export const layoutEffects = headerFooterConfig.effects;
export const layoutSpacing = headerFooterConfig.spacing;

