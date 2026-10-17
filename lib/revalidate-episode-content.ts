import { revalidatePath, revalidateTag } from 'next/cache'

/** Invalide toutes les surfaces susceptibles d'afficher une pochette Ausha. */
export function revalidateEpisodeContent(): void {
  revalidateTag('ausha-episodes')
  revalidateTag('ausha-derived-content')

  revalidatePath('/', 'page')
  revalidatePath('/api/episodes')
  revalidatePath('/ecouter', 'page')
  revalidatePath('/ecouter/derniers-episodes', 'page')
  revalidatePath('/episodes/[slug]', 'page')
  revalidatePath('/decouvrir', 'page')
  revalidatePath('/explorer/styles-de-danse', 'page')
}
