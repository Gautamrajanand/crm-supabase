'use client'

import { Database } from '@/types/database'
import { Dispatch, SetStateAction } from 'react'

type Deal = Database['public']['Tables']['deals']['Row']

interface DealFiltersProps {
  searchQuery: string
  onSearchChange: Dispatch<SetStateAction<string>>
  sortOrder: 'asc' | 'desc'
  onSortChange: Dispatch<SetStateAction<'asc' | 'desc'>>
  minValue: string
  onMinValueChange: Dispatch<SetStateAction<string>>
  maxValue: string
  onMaxValueChange: Dispatch<SetStateAction<string>>
}

export function DealFilters({
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  minValue,
  onMinValueChange,
  maxValue,
  onMaxValueChange,
}: DealFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Search Deals
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={searchQuery}
              className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Search by title, customer, or company"
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Sort */}
        <div className="w-full sm:w-48">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <select
            id="sort"
            name="sort"
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as 'asc' | 'desc')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="desc" className="bg-white dark:bg-gray-800">Newest First</option>
            <option value="asc" className="bg-white dark:bg-gray-800">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Value Range */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="min-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Min Value
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="min-value"
              id="min-value"
              value={minValue}
              className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="0.00"
              onChange={(e) => onMinValueChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1">
          <label htmlFor="max-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Max Value
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="max-value"
              id="max-value"
              value={maxValue}
              className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="0.00"
              onChange={(e) => onMaxValueChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
