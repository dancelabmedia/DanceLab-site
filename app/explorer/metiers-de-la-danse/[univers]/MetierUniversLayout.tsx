import type { Metier, MetierUniversId } from '../metiers-data'

interface Props {
  universId:  MetierUniversId
  metiers:    Metier[]
  children:   React.ReactNode
}

/** Enveloppe partagée. La navigation vers les métiers proches vit désormais
 * dans la fiche éditoriale, afin d'éviter la longue sidebar répétitive. */
export default function MetierUniversLayout({ children }: Props) {
  return (
    <div className="met-detail-wrap">
      <main className="met-detail-main">{children}</main>
    </div>
  )
}
