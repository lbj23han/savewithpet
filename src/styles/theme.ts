export const theme = {
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceWarm: "#FFF5F7",
    text: "#1C1C1E",
    muted: "#8E8E93",
    line: "#F2DAE5",
    orange: "#E8728C",
    orangeDark: "#B03060",
    purple: "#7B526A",
    purpleSoft: "#F5E0EB",
    green: "#2B9A75",
    greenSoft: "#E4F8EF",
    red: "#E04060",
    coin: "#F5B53D",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    xxl: "32px",
  },
  radius: {
    sm: "8px",
    md: "14px",
    lg: "20px",
    xl: "28px",
    pill: "999px",
  },
  shadow: {
    card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.07)",
    button: "0 4px 16px rgba(232, 114, 140, 0.28)",
  },
} as const;

export type AppTheme = typeof theme;
