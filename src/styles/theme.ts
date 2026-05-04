export const theme = {
  colors: {
    background: "#FFF8F0",
    surface: "#FFFFFF",
    surfaceWarm: "#F6EFE6",
    text: "#191512",
    muted: "#9B8E85",
    line: "#EFE3D8",
    orange: "#FF7A45",
    orangeDark: "#A43E12",
    purple: "#6F4EA3",
    purpleSoft: "#C6A2F2",
    green: "#0C8054",
    greenSoft: "#DFF8E9",
    red: "#C71616",
    coin: "#F6B600",
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
    lg: "22px",
    xl: "28px",
    pill: "999px",
  },
  shadow: {
    card: "0 10px 24px rgba(91, 63, 35, 0.08)",
    button: "0 10px 24px rgba(255, 122, 69, 0.22)",
  },
} as const;

export type AppTheme = typeof theme;
