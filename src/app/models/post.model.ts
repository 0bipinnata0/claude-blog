export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary: string;
  date: Date;
  coverImage: string;
  author?: string;
  tags?: string[];
}
