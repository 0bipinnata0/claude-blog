/**
 * Shared type definitions for CMS scripts
 */

/**
 * Post metadata stored in index.json
 */
export interface PostMetadata {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO 8601 format
  coverImage: string;
  author?: string;
  tags?: string[];
  fileName: string;
}

/**
 * Post attributes from YAML frontmatter
 */
export interface PostAttributes {
  title?: string;
  slug?: string;
  date?: string | Date;
  summary?: string;
  description?: string; // Alternative to summary
  coverImage?: string;
  image?: string; // Alternative to coverImage
  author?: string;
  tags?: string[];
}
