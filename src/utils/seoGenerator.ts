export const generateSeoFields = (name: string, description: string) => {
  const seoTitle = `${name} | ${
    process.env.SITE_NAME || "Electron Shop"
  }`.substring(0, 60);
  const baseText = `Find the best ${name} products`;
  const descText = description ? `: ${description.substring(0, 100)}` : "";
  const seoDescription = `${baseText}${descText}`.substring(0, 160);
  return { seoTitle, seoDescription };
};
