import { EditResourceForm } from "@/components/custom/EditResourceForm"

export default function EditResourcePage({ params }: { params: { id: string } }) {
  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="max-w-full">
        <EditResourceForm resourceId={params.id} />
      </div>
    </div>
  )
}
