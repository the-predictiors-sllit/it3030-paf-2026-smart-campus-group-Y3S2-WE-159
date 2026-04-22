import { EditResourceForm } from "@/components/custom/EditResourceForm"

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="max-w-full">
        <EditResourceForm resourceId={id} />
      </div>
    </div>
  )
}
