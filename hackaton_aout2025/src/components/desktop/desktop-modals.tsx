import type { FileItem } from "@/types/file-types"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrashIcon, EditIcon } from "lucide-react"
import { getFileItemIconEmoji } from "@/lib/file-icons"

interface DesktopModalsProps {
  showDeleteDialog: boolean
  showRenameDialog: boolean
  deleteTarget: FileItem | null
  renameTarget: FileItem | null
  newName: string
  onDeleteClose: () => void
  onRenameClose: () => void
  onConfirmDelete: () => void
  onConfirmRename: () => void
  onNewNameChange: (value: string) => void
}

export function DesktopModals({
  showDeleteDialog,
  showRenameDialog,
  deleteTarget,
  renameTarget,
  newName,
  onDeleteClose,
  onRenameClose,
  onConfirmDelete,
  onConfirmRename,
  onNewNameChange,
}: DesktopModalsProps) {
  return (
    <>
      {/* Modal de suppression */}
      <Modal
        isOpen={showDeleteDialog}
        onClose={onDeleteClose}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-500">
              Cette action est irréversible
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Êtes-vous sûr de vouloir supprimer cet élément ?
          </p>
          
          {deleteTarget && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-2xl">{getFileItemIconEmoji(deleteTarget)}</span>
                <span className="truncate">{deleteTarget.name}</span>
                <span className="text-gray-500 text-xs">
                  ({deleteTarget.type === 'folder' ? 'Dossier' : 'Fichier'})
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onDeleteClose}
          >
            Annuler
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirmDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Supprimer
          </Button>
        </div>
      </Modal>

      {/* Modal de renommage */}
      <Modal
        isOpen={showRenameDialog}
        onClose={onRenameClose}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <EditIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              Renommer l'élément
            </h3>
            <p className="text-sm text-gray-500">
              Entrez le nouveau nom
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          {renameTarget && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-2xl">{getFileItemIconEmoji(renameTarget)}</span>
                <span className="truncate">{renameTarget.name}</span>
                <span className="text-gray-500 text-xs">
                  ({renameTarget.type === 'folder' ? 'Dossier' : 'Fichier'})
                </span>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nouveau nom :
            </label>
            <Input
              value={newName}
              onChange={(e) => onNewNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  onConfirmRename()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  onRenameClose()
                }
              }}
              placeholder="Entrez le nouveau nom"
              className="w-full"
              autoFocus
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onRenameClose}
          >
            Annuler
          </Button>
          <Button 
            onClick={onConfirmRename}
            disabled={!newName.trim() || newName.trim() === (renameTarget?.name || "")}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            Renommer
          </Button>
        </div>
      </Modal>
    </>
  )
}
