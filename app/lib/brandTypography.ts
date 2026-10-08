// Font names shared with the home page and its Sanity typography controls.
export const fontStacks: Record<string, string> = {
  editorial: "'Cormorant Garamond', Georgia, serif",
  sans: "'Inter', Arial, sans-serif",
  classic: "Georgia, 'Times New Roman', serif",
  arial: "Arial, Helvetica, sans-serif",
  roboto: "'Roboto', Arial, sans-serif",
  inter: "'Inter', Arial, sans-serif",
  opensans: "'Open Sans', Arial, sans-serif",
  montserrat: "'Montserrat', Arial, sans-serif",
  poppins: "'Poppins', Arial, sans-serif",
  dmsans: "'DM Sans', Arial, sans-serif",
  lato: "'Lato', Arial, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  lora: "'Lora', Georgia, serif",
  merriweather: "'Merriweather', Georgia, serif",
};

// Home fields carrying data-vb-font-value="sans" use this CSS override.
// Unbound treatment cards and category links keep the inline Inter stack.
export function homeFontStack(font: string, fallbackFont: string, bound = true) {
  if (bound && font === 'sans') return "'Manrope', Arial, sans-serif";
  return fontStacks[font] || fontStacks[fallbackFont];
}
