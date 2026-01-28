export function generateTagSlug(tag: string) {
  return tag.toLowerCase().trim().replace(/\s+/g, "-");
}

export function generateTitleCase(name: string) {
  const arr = name.split(" ");
  const titleCase = arr
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return titleCase;
}