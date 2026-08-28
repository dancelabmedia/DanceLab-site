/**
 * /admin/comments — Interface de modération des commentaires
 *
 * Page serveur : charge les commentaires côté serveur, protégée par le middleware.
 * Le Client Component gère les actions dynamiques (approve / hide / delete).
 */

import { getAllCommentsForAdmin, getTotalCommentsAdmin } from '@/lib/db'
import AdminCommentsClient from './AdminCommentsClient'

export const dynamic = 'force-dynamic'

export default function AdminCommentsPage() {
  const comments = getAllCommentsForAdmin(300)
  const total    = getTotalCommentsAdmin()

  return <AdminCommentsClient initialComments={comments} total={total} />
}
