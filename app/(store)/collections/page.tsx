import type { Metadata } from 'next';

import CollectionsDirectoryExperience from '@/features/collection/pages/CollectionsDirectoryExperience';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Browse AJ Logik curated product collections.'
};

export default function CollectionsPage() {
  return <CollectionsDirectoryExperience />;
}
