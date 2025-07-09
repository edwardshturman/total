import {
  Configuration,
  CountryCode,
  ItemGetRequest,
  PlaidApi,
  PlaidEnvironments,
  Products,
  RemovedTransaction,
  Transaction as PlaidTransaction,
  TransactionsSyncRequest
} from "plaid"
import {
  createTransactions,
  deleteTransactions,
  getTransactions,
  updateTransactions
} from "@/functions/db/transactions"
import { APP_NAME } from "@/lib/constants"
import { Transaction } from "@/generated/prisma"
import { Decimal } from "@prisma/client/runtime/library"
import { createCursor, getCursor, updateCursor } from "@/functions/db/cursors"

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID
const PLAID_SECRET = process.env.PLAID_SECRET
const PLAID_ENV = process.env.PLAID_ENV || "sandbox"
const PLAID_PRODUCTS = [Products.Transactions]
const PLAID_COUNTRY_CODES = [CountryCode.Us]

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
      "Plaid-Version": "2020-09-14"
    }
  }
})

const client = new PlaidApi(configuration)

export async function createLinkToken(userId: string) {
  const linkTokenConfig = {
    user: {
      client_user_id: userId
    },
    client_name: APP_NAME,
    products: PLAID_PRODUCTS,
    country_codes: PLAID_COUNTRY_CODES,
    language: "en"
  }

  const response = await client.linkTokenCreate(linkTokenConfig)
  return response.data
}

export async function exchangePublicTokenForAccessToken(publicToken: string): Promise<string | null> {
  try {
    console.log(`Exchanging public_token=${publicToken} for access_token`)
    const response = await client.itemPublicTokenExchange({
      public_token: publicToken
    })

    const accessToken = response.data.access_token
    return accessToken
  } catch (error) {
    console.error("Error exchanging public token for access token:", error)
    return null
  }
}

export async function getAccountInfo(accessToken: string) {
  const accountsResponse = await client.accountsGet({ access_token: accessToken })
  return accountsResponse.data
}

export async function getItem(request: ItemGetRequest) {
  const response = await client.itemGet(request)
  const item = response.data.item
  return item
}

function convertPlaidTransactionToDatabaseTransaction(plaidTransaction: PlaidTransaction): Transaction {
  const newTransaction: Transaction = {
    id: plaidTransaction.transaction_id,
    accountId: plaidTransaction.account_id,
    currencyCode: plaidTransaction.iso_currency_code || "",
    amount: Decimal(plaidTransaction.amount),
    date: new Date(plaidTransaction.date),
    name: plaidTransaction.name,
    pending: plaidTransaction.pending || false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  return newTransaction
}

export async function syncTransactions(accessToken: string, accountId: string) {
  const cursorResponse = await getCursor(accessToken)
  let cursor = cursorResponse?.cursor || undefined

  let added: Array<Transaction> = []
  let modified: Array<Transaction> = []
  let removed: Array<RemovedTransaction> = []
  let hasMore = true

  // Fetch all updates
  while (hasMore) {
    const request: TransactionsSyncRequest = {
      access_token: accessToken,
      cursor: cursor,
    }
    const response = await client.transactionsSync(request)
    console.log("response: ", response)
    const data = response.data

    added = added.concat(data.added.map(convertPlaidTransactionToDatabaseTransaction))
    modified = modified.concat(data.modified.map(convertPlaidTransactionToDatabaseTransaction))
    removed = removed.concat(data.removed)

    hasMore = data.has_more
    cursor = data.next_cursor
  }

  // Apply changes to database
  if (removed.length > 0) {
    const removedIds = removed.map(r => r.transaction_id)
    await deleteTransactions(removedIds)
  }

  if (modified.length > 0) {
    await updateTransactions(modified)
  }

  if (added.length > 0) {
    await createTransactions(added)
  }

  // Update cursor
  if (!cursorResponse) {
    await createCursor({
      cursor: cursor || "",
      accessToken: accessToken,
    })
  } else {
    await updateCursor({
      id: cursorResponse.id,
      cursor: cursor || "",
    })
  }

  // Return the most updated list of transactions
  const resp = await getTransactions(accountId)
  console.log("returning transactions for accountId:", accountId, resp.length, "transactions found")
  return resp
}
