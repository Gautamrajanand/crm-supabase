'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase, type Event, type Project, type Customer, type TeamMember } from '@/utils/supabase'

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    project_id: '',
    customer_id: '',
    event_type: 'meeting' as const,
    attendees: [] as string[],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch events with related data
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*, projects(name), customers(name)')
        .order('start_time', { ascending: true })

      if (eventsError) throw eventsError

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .not('status', 'eq', 'Completed')

      if (projectsError) throw projectsError

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('status', 'Active')

      if (customersError) throw customersError

      // Fetch team members
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*')

      if (teamError) throw teamError

      setEvents(eventsData || [])
      setProjects(projectsData || [])
      setCustomers(customersData || [])
      setTeamMembers(teamData || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (selectedEvent?.id) {
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', selectedEvent.id)

        if (error) throw error

        // Update attendees
        await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', selectedEvent.id)

        if (formData.attendees.length > 0) {
          const attendeesData = formData.attendees.map((attendeeId) => ({
            event_id: selectedEvent.id,
            team_member_id: attendeeId,
          }))

          const { error: attendeesError } = await supabase
            .from('event_attendees')
            .insert(attendeesData)

          if (attendeesError) throw attendeesError
        }
      } else {
        const { data: eventData, error } = await supabase
          .from('events')
          .insert([formData])
          .select()
          .single()

        if (error) throw error

        // Add attendees
        if (formData.attendees.length > 0 && eventData) {
          const attendeesData = formData.attendees.map((attendeeId) => ({
            event_id: eventData.id,
            team_member_id: attendeeId,
          }))

          const { error: attendeesError } = await supabase
            .from('event_attendees')
            .insert(attendeesData)

          if (attendeesError) throw attendeesError
        }
      }

      setIsFormOpen(false)
      fetchData()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      // Delete attendees first
      await supabase.from('event_attendees').delete().eq('event_id', id)

      // Then delete the event
      const { error } = await supabase.from('events').delete().eq('id', id)

      if (error) throw error

      setEvents((prev) => prev.filter((event) => event.id !== id))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    const startTime = selectInfo.startStr
    const endTime = selectInfo.endStr

    setFormData({
      title: '',
      description: '',
      start_time: startTime,
      end_time: endTime,
      project_id: '',
      customer_id: '',
      event_type: 'meeting',
      attendees: [],
    })
    setSelectedEvent(null)
    setIsFormOpen(true)
  }

  const handleEventClick = (clickInfo: any) => {
    const event = events.find((e) => e.id === clickInfo.event.id)
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        start_time: event.start_time,
        end_time: event.end_time,
        project_id: event.project_id || '',
        customer_id: event.customer_id || '',
        event_type: event.event_type,
        attendees: event.attendees || [],
      })
      setSelectedEvent(event)
      setIsFormOpen(true)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <p className="mt-2 text-sm text-gray-700">
            Schedule and manage meetings, deadlines, and other events.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setSelectedEvent(null)
              setFormData({
                title: '',
                description: '',
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 3600000).toISOString(),
                project_id: '',
                customer_id: '',
                event_type: 'meeting',
                attendees: [],
              })
              setIsFormOpen(true)
            }}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add event
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          events={events.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.start_time,
            end: event.end_time,
            backgroundColor: (() => {
              switch (event.event_type) {
                case 'meeting':
                  return '#4F46E5' // indigo
                case 'deadline':
                  return '#DC2626' // red
                case 'task':
                  return '#2563EB' // blue
                default:
                  return '#9CA3AF' // gray
              }
            })(),
          }))}
        />
      </div>

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-lg rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {selectedEvent ? 'Edit Event' : 'Add Event'}
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="start_time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    id="start_time"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.start_time.slice(0, 16)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        start_time: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="end_time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    id="end_time"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.end_time.slice(0, 16)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        end_time: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="event_type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Event Type
                </label>
                <select
                  id="event_type"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.event_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      event_type: e.target.value as Event['event_type'],
                    }))
                  }
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="task">Task</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="project"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project
                </label>
                <select
                  id="project"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.project_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_id: e.target.value,
                    }))
                  }
                >
                  <option value="">No Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="customer"
                  className="block text-sm font-medium text-gray-700"
                >
                  Customer
                </label>
                <select
                  id="customer"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.customer_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customer_id: e.target.value,
                    }))
                  }
                >
                  <option value="">No Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="attendees"
                  className="block text-sm font-medium text-gray-700"
                >
                  Attendees
                </label>
                <select
                  id="attendees"
                  multiple
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.attendees}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
                    setFormData((prev) => ({
                      ...prev,
                      attendees: selected,
                    }))
                  }}
                >
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Hold Ctrl/Cmd to select multiple attendees
                </p>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                >
                  {selectedEvent ? 'Save Changes' : 'Create Event'}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}
