/**
 * HTTP client stub and static demo template catalog
 */
import axios, { type AxiosInstance } from 'axios'

/** Typed Axios client reserved for future remote sync */
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/** Metadata shown in template pickers (content lives in seed-demo) */
export interface DemoTemplateMeta {
  id: string
  title: string
  description: string
  icon: string
  category: 'blank' | 'docs' | 'planning' | 'personal'
}

const DEMO_TEMPLATES: readonly DemoTemplateMeta[] = [
  {
    id: 'blank',
    title: 'Blank page',
    description: 'Start from an empty document',
    icon: 'file',
    category: 'blank',
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'A short guide to using Noto',
    icon: 'rocket',
    category: 'docs',
  },
  {
    id: 'product-spec',
    title: 'Product Spec',
    description: 'Structured product requirements outline',
    icon: 'clipboard-list',
    category: 'docs',
  },
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Agenda, notes, and action items',
    icon: 'users',
    category: 'planning',
  },
  {
    id: 'personal-goals',
    title: 'Personal Goals',
    description: 'Track goals and weekly check-ins',
    icon: 'target',
    category: 'personal',
  },
] as const

/** Returns static template metadata (no network) */
export async function getDemoTemplates(): Promise<DemoTemplateMeta[]> {
  return [...DEMO_TEMPLATES]
}
