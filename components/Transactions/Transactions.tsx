"use client"
import { Transaction } from "@/generated/prisma"
import { useState, useMemo } from "react"
import { ChevronUp, ChevronDown, Search, Filter } from "lucide-react"

export function Transactions({ transactions }: { transactions: Transaction[] }) {
  const [sortField, setSortField] = useState<keyof Transaction>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPending = showPendingOnly ? transaction.pending : true
      return matchesSearch && matchesPending
    })

    return filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (sortField === 'date') {
        const dateA = new Date(aValue as string).getTime()
        const dateB = new Date(bValue as string).getTime()
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }

      if (sortField === 'amount') {
        const amountA = parseFloat(aValue as string)
        const amountB = parseFloat(bValue as string)
        return sortDirection === 'asc' ? amountA - amountB : amountB - amountA
      }

      const stringA = String(aValue).toLowerCase()
      const stringB = String(bValue).toLowerCase()

      if (sortDirection === 'asc') {
        return stringA.localeCompare(stringB)
      } else {
        return stringB.localeCompare(stringA)
      }
    })
  }, [transactions, sortField, sortDirection, searchQuery, showPendingOnly])

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const formatCurrency = (amount: string, currencyCode: string) => {
    const numAmount = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(numAmount)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const SortIcon = ({ field }: { field: keyof Transaction }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ?
      <ChevronUp style={{ width: '16px', height: '16px' }} /> :
      <ChevronDown style={{ width: '16px', height: '16px' }} />
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.title}>Transactions</h2>
          <div style={styles.subtitle}>
            {filteredAndSortedTransactions.length} of {transactions.length} transactions
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersContent}>
          <div style={styles.searchContainer}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.checkboxContainer}>
            <Filter style={styles.filterIcon} />
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showPendingOnly}
                onChange={(e) => setShowPendingOnly(e.target.checked)}
                style={styles.checkbox}
              />
              Pending only
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.tableHead}>
            <tr>
              <th
                style={styles.tableHeader}
                onClick={() => handleSort('date')}
              >
                <div style={styles.headerCell}>
                  Date
                  <SortIcon field="date" />
                </div>
              </th>
              <th
                style={styles.tableHeader}
                onClick={() => handleSort('name')}
              >
                <div style={styles.headerCell}>
                  Description
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                style={styles.tableHeader}
                onClick={() => handleSort('amount')}
              >
                <div style={styles.headerCell}>
                  Amount
                  <SortIcon field="amount" />
                </div>
              </th>
              <th style={styles.tableHeaderNonClickable}>
                Status
              </th>
              <th
                style={styles.tableHeader}
                onClick={() => handleSort('transactionId')}
              >
                <div style={styles.headerCell}>
                  Transaction ID
                  <SortIcon field="transactionId" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody style={styles.tableBody}>
            {filteredAndSortedTransactions.map((transaction) => (
              <tr key={transaction.id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  {formatDate(transaction.date)}
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.descriptionCell} title={transaction.name}>
                    {transaction.name}
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.amountCell,
                    color: parseFloat(transaction.amount.toString()) >= 0 ? '#059669' : '#dc2626'
                  }}>
                    {formatCurrency(transaction.amount.toString(), transaction.currencyCode)}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: transaction.pending ? '#fef3c7' : '#d1fae5',
                    color: transaction.pending ? '#92400e' : '#065f46'
                  }}>
                    {transaction.pending ? 'Pending' : 'Completed'}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.transactionId}>
                    {transaction.transactionId}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAndSortedTransactions.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateText}>
            {searchQuery || showPendingOnly ? 'No transactions match your filters' : 'No transactions found'}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280'
  },
  filtersContainer: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  filtersContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px'
  },
  searchContainer: {
    flex: 1,
    position: 'relative' as const
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    width: '16px',
    height: '16px'
  },
  searchInput: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterIcon: {
    width: '16px',
    height: '16px',
    color: '#9ca3af'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer'
  },
  checkbox: {
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    color: '#2563eb',
    cursor: 'pointer'
  },
  tableContainer: {
    overflowX: 'auto' as const
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  tableHead: {
    backgroundColor: '#f9fafb'
  },
  tableHeader: {
    padding: '12px 24px',
    textAlign: 'left' as const,
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease-in-out'
  },
  tableHeaderNonClickable: {
    padding: '12px 24px',
    textAlign: 'left' as const,
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  headerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  tableBody: {
    backgroundColor: '#ffffff',
    divide: '1px solid #e5e7eb'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.15s ease-in-out',
    cursor: 'default'
  },
  tableCell: {
    padding: '16px 24px',
    fontSize: '14px',
    color: '#111827',
    whiteSpace: 'nowrap' as const
  },
  descriptionCell: {
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const
  },
  amountCell: {
    fontWeight: '500'
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '9999px'
  },
  transactionId: {
    fontFamily: 'monospace',
    color: '#6b7280'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 0'
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: '14px'
  }
}
