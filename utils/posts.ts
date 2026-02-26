import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type Post = {
  title: string;
  date: string;
  category: string;
  tags: string[];
  type: string;
  excerpt: string;
  cover: string;
  featured: boolean;
  slug: string;
};

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    return {
      ...data,
      slug,
      tags: data.tags || [],
      featured: !!data.featured,
    } as Post;
  });
  // Ordenar por fecha descendente
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getFeaturedPosts(): Post[] {
  return getAllPosts().filter(post => post.featured);
}

export function getRecentPosts(): Post[] {
  return getAllPosts().slice(0, 6);
}

export function getPostBySlug(slug: string): (Post & { content: string }) | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    ...data,
    slug,
    tags: data.tags || [],
    featured: !!data.featured,
    content,
  } as Post & { content: string };
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}

export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set<string>();
  posts.forEach(post => {
    if (post.category) categories.add(post.category);
  });
  return Array.from(categories).sort();
}
