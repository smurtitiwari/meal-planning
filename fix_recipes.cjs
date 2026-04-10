const fs = require('fs');

let content = fs.readFileSync('src/pages/Recipes.tsx', 'utf8');

// Insert color definitions inside the component
const colorDefs = `
  const lightColors = {
    accent: '#3C151A',
    accentPurple: '#3C151A',
    accentLight: '#FBF5F6',
    accentBorder: '#D9D9D9',
    accentText: '#3C151A',
    surface: '#FFFFFF',
    pageSurface: '#FFFFFF',
    card: '#F6F6F6',
    border: '#F4F4F4',
    elevated: '#FBFBFB',
    textPrimary: '#111111',
    textSecondary: '#8A8A8A',
    textTertiary: '#8A8A8A',
    warmSurface: '#FBFBFB'
  }
  const darkColors = {
    accent: '#9A4D5A',
    accentPurple: '#9A4D5A',
    accentLight: 'rgba(154, 77, 90, 0.18)',
    accentBorder: '#6A2B34',
    surface: '#121212',
    pageSurface: '#121212',
    card: '#1B1B1B',
    border: '#2E2E2E',
    elevated: '#111111',
    textPrimary: '#FEFEFE',
    textSecondary: '#D6D1D3',
    textTertiary: '#A9A0A3',
    accentText: '#F0C7CF',
    warmSurface: '#111111'
  }
  const colors = preferences.darkMode ? darkColors : lightColors;
`;

content = content.replace(/export default function Recipes\(\) \{\n  const \{/g, "export default function Recipes() {\n  const {");
content = content.replace(/const userName = preferences.name \|\| 'You'/g, `const userName = preferences.name || 'You'\n${colorDefs}`);

// Replace hardcoded colors
content = content.replace(/'#F7F3EE'/g, "colors.pageSurface");
content = content.replace(/'#1F1E2E'/g, "colors.textPrimary");
content = content.replace(/'#A09DAB'/g, "colors.textSecondary");
content = content.replace(/'#7A768A'/g, "colors.textTertiary");
content = content.replace(/'#26233A'/g, "colors.accent");
content = content.replace(/'#EFE9E0'/g, "colors.border");
content = content.replace(/'#EAE4DC'/g, "colors.border");
content = content.replace(/'#B8A6E6'/g, "colors.accentBorder");
content = content.replace(/'#8B74D3'/g, "colors.accent");
content = content.replace(/'#EFEAFF'/g, "colors.accentLight");
content = content.replace(/'#FFF'/g, "colors.surface");
content = content.replace(/'#FFFFFF'/g, "colors.surface");

fs.writeFileSync('src/pages/Recipes.tsx', content, 'utf8');
