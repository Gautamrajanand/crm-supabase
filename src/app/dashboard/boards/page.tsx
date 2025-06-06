import BoardContent from '@/components/board/board-content'
import { CreateBoardDialog } from '@/components/board/create-board-dialog'

export const dynamic = 'force-dynamic'

export default function BoardsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Boards</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your leads and track their progress through your sales pipeline.
            </p>
          </div>
          <CreateBoardDialog onBoardCreated={() => {}} />
        </div>
      </div>
      <BoardContent />
    </div>
  )
}
