import React, { useState, CSSProperties } from "react"
import { ChevronDown, Filter } from "lucide-react"
import { Account } from "@/generated/prisma"

interface FilterDropdownProps {
  accounts: Account[]
  selectedAccounts: Account[]
  setSelectedAccounts: React.Dispatch<React.SetStateAction<Account[]>>
}

export default function FilterDropdown({
  accounts,
  selectedAccounts,
  setSelectedAccounts
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isButtonHovered, setIsButtonHovered] = useState(false)

  const handleAccountSelect = (account: Account | "all") => {
    if (account === "all") {
      // If "All accounts" is selected, select all accounts
      setSelectedAccounts(accounts)
    } else {
      // Toggle individual account selection
      const isSelected = selectedAccounts.some(
        (selected) => selected.id === account.id
      )
      if (isSelected) {
        setSelectedAccounts(
          selectedAccounts.filter((selected) => selected.id !== account.id)
        )
      } else {
        setSelectedAccounts([...selectedAccounts, account])
      }
    }
  }

  const getButtonText = () => {
    if (selectedAccounts.length === 0) {
      return "No accounts selected"
    } else if (selectedAccounts.length === accounts.length) {
      return "All accounts"
    } else if (selectedAccounts.length === 1) {
      return selectedAccounts[0].name
    } else {
      return `${selectedAccounts.length} accounts selected`
    }
  }

  const isAllSelected = selectedAccounts.length === accounts.length

  const styles: { [key: string]: CSSProperties } = {
    container: {
      position: "relative",
      display: "inline-block"
    },
    filterButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      backgroundColor: "#ffffff",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#d1d5db",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      outline: "none",
      minWidth: "215px"
    },
    filterButtonHover: {
      backgroundColor: "#f9fafb"
    },
    filterButtonFocus: {
      outline: "none",
      boxShadow: "0 0 0 2px #3b82f6",
      borderColor: "#3b82f6"
    },
    filterIcon: {
      width: "20px",
      height: "20px",
      color: "black"
    },
    buttonText: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151",
      flex: "1",
      textAlign: "left" as const
    },
    chevronIcon: {
      width: "16px",
      height: "16px",
      color: "#6b7280",
      transition: "transform 0.2s ease"
    },
    chevronIconRotated: {
      transform: "rotate(180deg)"
    },
    dropdown: {
      position: "absolute",
      top: "100%",
      left: "0",
      marginTop: "4px",
      width: "224px",
      backgroundColor: "#ffffff",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#e5e7eb",
      borderRadius: "6px",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      zIndex: "50"
    },
    dropdownInner: {
      padding: "4px 0"
    },
    dropdownItem: {
      width: "100%",
      textAlign: "left" as const,
      padding: "8px 16px",
      fontSize: "14px",
      color: "#374151",
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      outline: "none",
      transition: "background-color 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    dropdownItemHover: {
      backgroundColor: "#f3f4f6"
    },
    dropdownItemSelected: {
      backgroundColor: "#dbeafe",
      color: "#1d4ed8",
      fontWeight: "500"
    },
    checkbox: {
      width: "16px",
      height: "16px",
      borderRadius: "3px",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "#d1d5db",
      backgroundColor: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      color: "white"
    },
    checkboxChecked: {
      backgroundColor: "#3b82f6",
      borderColor: "#3b82f6"
    },
    overlay: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      zIndex: "40"
    }
  }

  return (
    <div style={styles.container}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.filterButton,
          ...(isButtonHovered && !isOpen ? styles.filterButtonHover : {}),
          ...(isOpen ? styles.filterButtonFocus : {})
        }}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
      >
        <Filter style={styles.filterIcon} />
        <span style={styles.buttonText}>{getButtonText()}</span>
        <ChevronDown
          style={{
            ...styles.chevronIcon,
            ...(isOpen ? styles.chevronIconRotated : {})
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownInner}>
            {/* All accounts option */}
            <button
              onClick={() => handleAccountSelect("all")}
              style={{
                ...styles.dropdownItem,
                ...(isAllSelected ? styles.dropdownItemSelected : {}),
                ...(hoveredItem === "all" && !isAllSelected
                  ? styles.dropdownItemHover
                  : {})
              }}
              onMouseEnter={() => setHoveredItem("all")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div
                style={{
                  ...styles.checkbox,
                  ...(isAllSelected ? styles.checkboxChecked : {})
                }}
              >
                {isAllSelected && "✓"}
              </div>
              All accounts
            </button>

            {/* Individual account options */}
            {accounts.map((account) => {
              const isSelected = selectedAccounts.some(
                (selected) => selected.id === account.id
              )
              return (
                <button
                  key={account.id}
                  onClick={() => handleAccountSelect(account)}
                  style={{
                    ...styles.dropdownItem,
                    ...(isSelected ? styles.dropdownItemSelected : {}),
                    ...(hoveredItem === account.id && !isSelected
                      ? styles.dropdownItemHover
                      : {})
                  }}
                  onMouseEnter={() => setHoveredItem(account.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div
                    style={{
                      ...styles.checkbox,
                      ...(isSelected ? styles.checkboxChecked : {})
                    }}
                  >
                    {isSelected && "✓"}
                  </div>
                  {account.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div style={styles.overlay} onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
