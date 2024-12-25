import cuid from "cuid";
import { prisma } from "../app";


export async function generateUniqueSlug(
  name: string,
  model: "mainCategory" | "subCategory"
): Promise<string> {
  let slug = name.toLowerCase().replace(/\s+/g, "-");
  let uniqueSlug = slug;
  let count = 1;

  while (await (prisma[model] as any).findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${cuid()}`;
    count++;
  }

  return uniqueSlug;
}
