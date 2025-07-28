'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'
import '@/styles/shepherd-custom.css'

export function useOnboardingTour() {
  const router = useRouter()
  const [tour, setTour] = useState<any>(null)
  const totalSteps = 8 // Total number of steps in the tour

  useEffect(() => {
    // Initialize tour with modern styling
    const newTour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-theme-default',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: {
          enabled: true
        },
        highlightClass: 'shepherd-highlighted',
        // Use type assertion for popperOptions
        ...({
          popperOptions: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 12]
                }
              }
            ]
          }
        } as any)
      }
    })
    
    // All styles are now in the external CSS file

    // Define button styles for consistency
    const primaryButtonClass = 'shepherd-button-primary'
    const secondaryButtonClass = 'shepherd-button-secondary'

    // Helper function to create progress bar HTML
    const createProgressBar = (current: number, total: number) => {
      const percent = (current / total) * 100;
      return `
        <div class="mt-4 pt-2">
          <div class="flex items-center justify-between mb-1 text-xs">
            <span>Progress</span>
            <span>${current}/${total}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div class="bg-primary h-2 rounded-full" style="width: ${percent}%"></div>
          </div>
        </div>
      `;
    };

    // Add tour steps
    newTour.addSteps([
      {
        id: 'welcome',
        title: 'Welcome to HubCRM',
        text: `Welcome to your CRM! Let's take a quick tour of the main features.
               ${createProgressBar(1, totalSteps)}`,
        buttons: [
          {
            text: 'Skip',
            classes: secondaryButtonClass,
            action: () => newTour.complete()
          },
          {
            text: 'Next',
            classes: primaryButtonClass,
            action: () => newTour.next()
          }
        ]
      },
      {
        id: 'overview',
        title: 'Dashboard Overview',
        text: `This is your overview dashboard where you can see key metrics and activity.
               ${createProgressBar(2, totalSteps)}`,
        attachTo: {
          element: '[data-tour="overview"]',
          on: 'right'
        },
        buttons: [
          {
            text: 'Back',
            classes: secondaryButtonClass,
            action: () => newTour.back()
          },
          {
            text: 'Next',
            classes: primaryButtonClass,
            action: () => newTour.next()
          }
        ]
      },
      {
        id: 'outreach',
        title: 'Outreach Pipeline',
        text: `Track and manage your prospects in the outreach pipeline.
               ${createProgressBar(3, totalSteps)}`,
        attachTo: {
          element: '[data-tour="outreach"]',
          on: 'right'
        },
        buttons: [
          {
            text: 'Back',
            classes: secondaryButtonClass,
            action: () => newTour.back()
          },
          {
            text: 'Next',
            classes: primaryButtonClass,
            action: () => newTour.next()
          }
        ]
      },
      {
        id: 'deals',
        title: 'Deals Management',
        text: `Monitor your leads and deals in progress.
               ${createProgressBar(4, totalSteps)}`,
        attachTo: {
          element: '[data-tour="deals"]',
          on: 'right'
        },
        buttons: [
          {
            text: 'Back',
            classes: secondaryButtonClass,
            action: () => newTour.back()
          },
          {
            text: 'Next',
            classes: primaryButtonClass,
            action: () => newTour.next()
          }
        ]
      },
      {
        id: 'customers',
        title: 'Customer Relationships',
        text: `View and manage your customer relationships.
               ${createProgressBar(5, totalSteps)}`,
        attachTo: {
          element: '[data-tour="customers"]',
          on: 'right'
        },
        buttons: [
          {
            text: 'Back',
            classes: secondaryButtonClass,
            action: () => newTour.back()
          },
          {
            text: 'Next',
            classes: primaryButtonClass,
            action: () => newTour.next()
          }
        ]
      },
      {
        id: 'tasks',
        title: 'Task Management',
        text: `Keep track of your tasks and to-dos.
               ${createProgressBar(6, totalSteps)}`,
        attachTo: {
          element: '[data-tour="tasks"]',
          on: 'right'
        },
        buttons: [
          {
            text: 'Back',
            classes: secondaryButtonClass,
            action: () => newTour.back()
          },
          {
            text: 'Next',
            classes: primaryButtonClass,
            action: () => newTour.next()
          }
        ]
      },
      {
        id: 'calendar',
        title: 'Calendar & Events',
        text: `Schedule and manage your meetings and events.
               ${createProgressBar(7, totalSteps)}`,
        attachTo: {
          element: '[data-tour="calendar"]',
          on: 'right'
        },
        buttons: [
          {
            text: 'Back',
            classes: secondaryButtonClass,
            action: () => newTour.back()
          },
          {
            text: 'Next',
            classes: primaryButtonClass,
            action: () => newTour.next()
          }
        ]
      },
      {
        id: 'settings',
        title: 'Settings & Preferences',
        text: `Customize your workspace and manage preferences.
               ${createProgressBar(8, totalSteps)}`,
        attachTo: {
          element: '[data-tour="settings"]',
          on: 'right'
        },
        buttons: [
          {
            text: 'Back',
            classes: secondaryButtonClass,
            action: () => newTour.back()
          },
          {
            text: 'Done',
            classes: primaryButtonClass,
            action: () => newTour.complete()
          }
        ]
      }
    ])

    // Save tour instance
    setTour(newTour)

    // Cleanup
    return () => {
      if (newTour) {
        newTour.complete()
      }
    }
  }, [])

  // Function to start the tour
  const startTour = () => {
    // Navigate to dashboard first to ensure all tour elements are available
    router.push('/dashboard')

    // Start tour after a longer delay to ensure elements are fully rendered
    setTimeout(() => {
      if (tour) {
        // The data-tour attributes are now directly added to sidebar elements in the sidebar component
        // No need to dynamically set them here anymore
        
        // Log tour start for debugging
        console.log('Starting onboarding tour')
        
        // Ensure all tour elements are accessible
        const tourElements = {
          overview: document.querySelector('[data-tour="overview"]'),
          outreach: document.querySelector('[data-tour="outreach"]'),
          deals: document.querySelector('[data-tour="deals"]'),
          customers: document.querySelector('[data-tour="customers"]'),
          tasks: document.querySelector('[data-tour="tasks"]'),
          calendar: document.querySelector('[data-tour="calendar"]'),
          settings: document.querySelector('[data-tour="settings"]')
        }
        
        // Log found elements for debugging
        console.log('Tour elements found:', Object.entries(tourElements).map(([k, v]) => `${k}: ${v ? 'Found' : 'Missing'}`))
        
        // Mark tour as seen in localStorage
        localStorage.setItem('hasSeenTour', 'true')
        
        // Ensure buttons are interactive by adding pointer-events-auto
        document.querySelectorAll('.shepherd-button').forEach(button => {
          button.classList.add('pointer-events-auto')
        })
        
        tour.start()
        
        // Add event listener for when tour shows a step
        tour.on('show', () => {
          // Ensure buttons are interactive after each step
          setTimeout(() => {
            document.querySelectorAll('.shepherd-button').forEach(button => {
              button.classList.add('pointer-events-auto')
            })
          }, 100)
        })
      }
    }, 1500) // Increased delay to ensure DOM is fully loaded
  }

  // Check if user has seen the tour
  const hasSeenTour = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasSeenTour') === 'true'
    }
    return false
  }

  return {
    startTour,
    hasSeenTour
  }
}
