import { createContext, useContext } from 'react';
import type { KnowledgeNode } from './knowledge';

export type Lang = 'en' | 'cn';

export const LangContext = createContext<Lang>('en');

export function useName(node: KnowledgeNode): string {
  const lang = useContext(LangContext);
  return lang === 'en' ? node.nameEn : node.nameCn;
}
