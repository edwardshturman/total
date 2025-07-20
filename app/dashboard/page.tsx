import * as React from "react"
import { PieChartActiveArc } from "@/components/PieChartActiveArc"
import {
  getDetailedCategories,
  getPrimaryCategories
} from "@/functions/db/categories"
import { getUserIncludeItemsAccountsTransactions } from "@/functions/db/users"
import { Transaction } from "@/generated/prisma"
import { getOrCreateCurrentUser } from "@/lib/auth"

interface Category {
  name: string
  transactions: Transaction[]
}

export default async function Dashboard() {
  const currentUser = await getOrCreateCurrentUser()
  const user = await getUserIncludeItemsAccountsTransactions(currentUser.id)
  const primaryCategories = await getPrimaryCategories()
  const detailedCategories = await getDetailedCategories()

  const transactions = user?.items
    .flatMap((item) => item.accounts)
    .flatMap((account) => account.transactions || []) // Handle undefined transactions + flatten properly

  const createCategoryData = (categories: Category[]) =>
    categories
      .map((category) => ({
        label: category.name,
        value:
          transactions
            ?.filter((t) => category.transactions.find((tr) => tr.id === t.id))
            ?.reduce((sum, t) => sum + t.amount.toNumber(), 0) || 0
      }))
      .filter((entry) => entry.value > 0)

  const primaryCategoryData = createCategoryData(primaryCategories)
  const detailedCategoryData = createCategoryData(detailedCategories)

  return (
    <>
      <h1>Dashboard</h1>
      <h2>Primary Category Pie Chart</h2>
      <PieChartActiveArc data={primaryCategoryData} />

      <h2>Detailed Category Pie Chart</h2>
      <PieChartActiveArc data={detailedCategoryData} />
    </>
  )
}
