import { Payment, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData() {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "98769786",
      amount: 150,
      status: "active",
      email: "merr@example.com",
    },
  ]
}

export default async function AdminCommunitiesPage() {
  const data = await getData()

  return (
    <div className="">
      <div>
        <h3 className="text-lg font-medium">Communities</h3>
        <p className="text-sm text-muted-foreground">
          Stuff about the Community
        </p>
      </div>
      <div className="mx-auto mt-3">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
