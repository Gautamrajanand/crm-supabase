'use client'

import React, { createContext, useContext, useState } from 'react'
import CustomerDrawer from '@/components/customers/customer-drawer'
import { Customer } from '@/types/shared'

interface CustomerDrawerContextType {
  openCustomerDrawer: (customer: Customer) => void
  closeCustomerDrawer: () => void
  selectedCustomer: Customer | null
  isDrawerOpen: boolean
}

const CustomerDrawerContext = createContext<CustomerDrawerContextType | null>(null)

export function CustomerDrawerProvider({ children }: { children: React.ReactNode }) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const openCustomerDrawer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDrawerOpen(true)
  }

  const closeCustomerDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedCustomer(null)
  }

  const handleCustomerChange = (updatedCustomer: Customer) => {
    setSelectedCustomer(updatedCustomer)
  }

  return (
    <CustomerDrawerContext.Provider
      value={{
        openCustomerDrawer,
        closeCustomerDrawer,
        selectedCustomer,
        isDrawerOpen,
      }}
    >
      {children}
      {selectedCustomer && (
        <CustomerDrawer
          customer={selectedCustomer}
          open={isDrawerOpen}
          onOpenChange={(open: boolean) => {
            setIsDrawerOpen(open)
            if (!open) {
              setSelectedCustomer(null)
            }
          }}
          onChange={handleCustomerChange}
        />
      )}
    </CustomerDrawerContext.Provider>
  )
}

export const useCustomerDrawer = () => {
  const context = useContext(CustomerDrawerContext)
  if (!context) {
    throw new Error('useCustomerDrawer must be used within a CustomerDrawerProvider')
  }
  return context
}
