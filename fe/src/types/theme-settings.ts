export type SystemFontType =
  // Sans-Serif
  | 'Arial'
  | 'Helvetica'
  | 'Verdana'
  | 'Trebuchet MS'
  | 'Tahoma'
  | 'Segoe UI'
  | 'Calibri'
  | 'Candara'
  | 'Corbel'
  | 'Lucida Sans'
  | 'Lucida Grande'
  | 'Gill Sans'
  | 'Futura'
  | 'Century Gothic'
  | 'Optima'
  | 'Geneva'
  | 'Franklin Gothic Medium'
  | 'Impact'
  | 'Arial Black'
  // Serif
  | 'Times New Roman'
  | 'Times'
  | 'Georgia'
  | 'Garamond'
  | 'Cambria'
  | 'Baskerville'
  | 'Palatino'
  | 'Palatino Linotype'
  | 'Book Antiqua'
  | 'Didot'
  | 'Bodoni MT'
  | 'Constantia'
  | 'Big Caslon'
  // Monospace
  | 'Courier New'
  | 'Courier'
  | 'Lucida Console'
  | 'Monaco'
  | 'Consolas'
  | 'Menlo'
  | 'Andale Mono'
  // Display / Cursive / Fantasy
  | 'Comic Sans MS'
  | 'Brush Script MT'
  | 'Copperplate'
  | 'Papyrus';

export type GoogleFontType =
  // Clean UI & Tech Sans-Serif
  | 'Inter'
  | 'Geist'
  | 'Plus Jakarta Sans'
  | 'Manrope'
  | 'Figtree'
  | 'DM Sans'
  | 'Roboto'
  | 'Open Sans'
  | 'Outfit'
  | 'Lexend'
  // Geometric, Heading & Neo-Grotesque
  | 'Montserrat'
  | 'Poppins'
  | 'Space Grotesk'
  | 'Bricolage Grotesque'
  | 'Syne'
  | 'Epilogue'
  | 'Cabinet Grotesk'
  | 'Albert Sans'
  // Modern Editorial & Display Serifs
  | 'Instrument Serif'
  | 'Playfair Display'
  | 'DM Serif Display'
  | 'Fraunces'
  | 'Merriweather'
  | 'Newsreader'
  | 'Bodoni Moda'
  | 'Lora'
  // Developer & Monospaced
  | 'JetBrains Mono'
  | 'Fira Code'
  | 'Geist Mono'
  | 'Space Mono'
  | 'IBM Plex Mono'
  | 'Source Code Pro';

export type FontType = SystemFontType | GoogleFontType;

export type Typography = {
  id: string;
  headingFont: FontType;
  bodyFont: FontType;
  headingWeight: number;
  bodyWeight: number;
  headingLineHeight: number;
  bodyLineHeight: number;
  headingLetterSpacing: number;
  bodyLetterSpacing: number;
};

export type ColorPalette = {
  id: string;
  colorBackground: string;
  colorSurface: string;
  colorBorder: string;
  colorTextPrimary: string;
  colorTextSecondary: string;
  colorPrimary: string;
  colorPrimaryForeground: string;
  colorSecondary: string;
  colorSecondaryForeground: string;
  colorAccent: string;
  colorAccentForeground: string;
};

export type ThemeSettings = {
  id: string;
  typography: Typography;
  colorPalette: ColorPalette;
};
