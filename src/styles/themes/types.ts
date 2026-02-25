export interface ColorTokens {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    link: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  accent: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
  };
}

export interface AppTheme {
  name: 'dark' | 'light';
  colors: ColorTokens;
}
