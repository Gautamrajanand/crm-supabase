'use client'

import React, { createContext, useContext, useState } from 'react'
import type { Customer } from '@/types/supabase'

interface CustomerDrawerContextType {
  isOpen: boolean
  customer: Customer | null
  openDrawer: (customer: Customer) => void
  closeDrawer: () => void
}

const CustomerDrawerContext = createContext<CustomerDrawerContextType | undefined>(undefined)

export function CustomerDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)

  const openDrawer = (customer: Customer) => {
    setCustomer(customer)
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setCustomer(null)
  }

  return (
    <CustomerDrawerContext.Provider value={{ isOpen, customer, openDrawer, closeDrawer }}>
      {children}
    </CustomerDrawerContext.Provider>
  )
}

export function useCustomerDrawer() {
  const context = useContext(CustomerDrawerContext)
  if (context === undefined) {
    throw new Error('useCustomerDrawer must be used within a CustomerDrawerProvider')
  }
  return context
}
