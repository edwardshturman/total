// Functions
import { auth, isAuthorized } from "@/lib/auth";
import { getItems } from "@/functions/db/items";
import { redirect, unauthorized } from "next/navigation";
import { createUser, getUserByEmail } from "@/functions/db/users";
import {
  createLinkToken,
  getAccounts,
  syncTransactions,
} from "@/functions/plaid";
import {
  convertTransactionForClient,
  getTransactions,
} from "@/functions/db/transactions";
import { decryptAccessToken } from "@/functions/crypto/utils";

// Components
import { SignOut } from "@/components/SignOut";
import { PlaidLink } from "@/components/PlaidLink";
import { Transactions } from "@/components/Transactions";

// Types
import type { Transaction } from "@/generated/prisma";

export default async function Plaid() {
  const session = await auth();
  if (!session) redirect("/");
  const authorized = isAuthorized(session);
  if (!authorized) unauthorized();

  const linkTokenResponse = await createLinkToken(session!.user!.id!);

  // TODO: verification function for having a full user object
  let user = await getUserByEmail(session!.user!.email!);
  if (!user) {
    user = await createUser({
      name: session!.user!.name!,
      email: session!.user!.email!,
    });
  }

  // Pull encryption key and version from env
  const encryptionKey = process.env.KEY_IN_USE || "";
  const keyVersion = process.env.KEY_VERSION || "";

  // Sync and aggregate transactions from all of the user's accounts
  const userItems = await getItems(user.id);
  const transactions: Transaction[] = [];
  for (const item of userItems) {
    const encryptedAccessToken = item.accessToken;
    const { plainText: accessToken } = decryptAccessToken(
      encryptedAccessToken,
      encryptionKey,
      keyVersion
    );
    await syncTransactions(accessToken);

    const { accounts } = await getAccounts(accessToken);
    for (const account of accounts) {
      const accountTransactions = await getTransactions(account.account_id);
      transactions.push(...accountTransactions);
    }
  }

  const clientFriendlyTransactions = transactions.map(
    convertTransactionForClient
  );

  // TODO: After the user connects their accounts, add a new option for "add a new account"
  return (
    <>
      <p>User: {session!.user!.email!}</p>
      <p>Link token: {linkTokenResponse.link_token}</p>
      {userItems.length === 0 ? (
        <PlaidLink linkToken={linkTokenResponse.link_token} userId={user.id} />
      ) : (
        <Transactions transactions={clientFriendlyTransactions} />
      )}
      <SignOut />
    </>
  );
}
