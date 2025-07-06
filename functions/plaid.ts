import {
  Configuration,
  CountryCode,
  ItemGetRequest,
  PlaidApi,
  PlaidEnvironments,
  Products,
  RemovedTransaction,
  Transaction,
  TransactionsSyncRequest
} from "plaid"
import { APP_NAME } from "@/lib/constants"
import { getCursor } from "./db/queries"
import { CreateCursorInput, UpdateCursorInput } from "./db/types"
import { createCursor, updateCursor } from "./db/mutations"

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
      "Plaid-Version": "2020-09-14",
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

export async function exchangePublicTokenForAccessToken(publicToken: string) {
  console.log(`Exchanging public_token=${publicToken} for access_token`)
  const response = await client.itemPublicTokenExchange({
    public_token: publicToken
  })

  const accessToken = response.data.access_token
  return accessToken
}

export async function getAccountInfo(accessToken: string) {
  const accountsResponse = await client.accountsGet({ access_token: accessToken })
  return accountsResponse.data;
}

export async function getItem(request: ItemGetRequest) {
  const response = await client.itemGet(request)
  const item = response.data.item;
  return item;
}


// TODO: Create a notion of a cursor in the database to keep track of the last synced transaction
export async function syncTransactions(accessToken: string) {
  const cursorResponse = await getCursor(accessToken);
  let cursor = cursorResponse?.cursor || undefined;

  // New transaction updates since "cursor"
  let added: Array<Transaction> = [];
  let modified: Array<Transaction> = [];
  // Removed transaction ids
  let removed: Array<RemovedTransaction> = [];
  let hasMore = true;

  // Iterate through each page of new transaction updates for item
  while (hasMore) {
    const request: TransactionsSyncRequest = {
      access_token: accessToken,
      cursor: cursor,
    };
    const response = await client.transactionsSync(request);
    const data = response.data;

    // Add this page of results
    added = added.concat(data.added);
    modified = modified.concat(data.modified);
    removed = removed.concat(data.removed);

    hasMore = data.has_more;

    // Update cursor to the next cursor
    cursor = data.next_cursor;
  }

  // If the cursor doesn't exist in the database yet, create it
  if (!cursorResponse) {
    const createCursorInput: CreateCursorInput = {
      Cursor: cursor || "",
      AccessToken: accessToken,
    }
    const newCursor = await createCursor(createCursorInput);
    console.log(`Created new cursor: ${newCursor.cursor} for access token: ${newCursor.accessToken}`);
  } else {
    const updateCursorInput: UpdateCursorInput = {
      ID: cursorResponse.id,
      Cursor: cursor || "",
    }
    const updatedCursor = await updateCursor(updateCursorInput)
    console.log(`Updated cursor: ${updatedCursor.cursor} for access token: ${updatedCursor.accessToken}`);
  }

  return added.concat(modified);
}
