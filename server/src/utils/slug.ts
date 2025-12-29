import { prisma } from "../services/prisma.services";

/**
 * Converts a string to a URL-friendly slug.
 */
export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Generates a unique slug for a project.
 * If the slug exists, appends a random string or increment.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.project.findUnique({
            where: { subDomain: slug },
        });

        if (!existing) {
            return slug;
        }

        // If base slug is taken, append a random 4-char string for uniqueness
        // or just increment. Let's do a mix or just increment for simplicity.
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        slug = `${baseSlug}-${randomSuffix}`;

        // Safety break
        if (counter > 10) {
            slug = `${baseSlug}-${Date.now()}`;
            return slug;
        }
        counter++;
    }
}
