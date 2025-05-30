'use client'

import { useState, useEffect, FormEvent, FC } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCurrentStream } from '@/hooks/use-current-stream'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  isWithinInterval,
} from 'date-fns'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import type { EventContentArg } from '@fullcalendar/core'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DialogFooter } from '@/components/ui/dialog'

import {
  CalendarIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

type EventType = 'meeting' | 'call' | 'task' | 'reminder'

interface Event {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  all_day: boolean | null
  event_type: EventType | null
  stream_id?: string | null
}

interface EventDialogProps {
  event: Partial<Event> | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (event: Partial<Event>) => Promise<void>
  onDelete?: () => Promise<void>
}

const colorMap: Record<EventType, string> = {
  meeting: 'bg-blue-500/80 dark:bg-blue-500/30 hover:bg-blue-600/90 dark:hover:bg-blue-500/40 border border-blue-600/20 dark:border-blue-400/20',
  call: 'bg-green-500/80 dark:bg-green-500/30 hover:bg-green-600/90 dark:hover:bg-green-500/40 border border-green-600/20 dark:border-green-400/20',
  task: 'bg-orange-500/80 dark:bg-orange-500/30 hover:bg-orange-600/90 dark:hover:bg-orange-500/40 border border-orange-600/20 dark:border-orange-400/20',
  reminder: 'bg-purple-500/80 dark:bg-purple-500/30 hover:bg-purple-600/90 dark:hover:bg-purple-500/40 border border-purple-600/20 dark:border-purple-400/20',
}

const EventDialog: FC<EventDialogProps> = ({
  event,
  open,
  onOpenChange,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [eventType, setEventType] = useState<EventType>(event?.event_type || 'meeting')
  const [startDate, setStartDate] = useState<Date | null>(
    event?.start_time ? parseISO(event.start_time) : new Date()
  )
  const [endDate, setEndDate] = useState<Date | null>(
    event?.end_time ? parseISO(event.end_time) : new Date()
  )
  const [allDay, setAllDay] = useState(event?.all_day || false)

  useEffect(() => {
    if (event) {
      setTitle(event.title || '')
      setDescription(event.description || '')
      setEventType(event.event_type || 'meeting')
      setStartDate(event.start_time ? parseISO(event.start_time) : new Date())
      setEndDate(event.end_time ? parseISO(event.end_time) : new Date())
      setAllDay(event.all_day || false)
    } else {
      // Reset form when creating new event
      setTitle('')
      setDescription('')
      setEventType('meeting')
      setStartDate(new Date())
      setEndDate(new Date())
      setAllDay(false)
    }
  }, [event])

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setTitle('')
      setDescription('')
      setEventType('meeting')
      setStartDate(new Date())
      setEndDate(new Date())
      setAllDay(false)
    }
  }, [open])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (!startDate || !endDate) {
        toast.error('Please select start and end dates')
        return
      }

      if (endDate < startDate) {
        toast.error('End date must be after start date')
        return
      }

      await onSave({
        id: event?.id,
        title,
        description,
        event_type: eventType,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        all_day: allDay,
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting event:', error)
      toast.error('Failed to save event')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:shadow-lg">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Add Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <select
              id="event-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <div className="relative">
                <DatePicker
                  id="start-date"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <div className="relative">
                <DatePicker
                  id="end-date"
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="all-day"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <Label htmlFor="all-day">All Day Event</Label>
          </div>

          <DialogFooter className="gap-2">
            {onDelete && (
              <Button
                type="button"
                onClick={onDelete}
                variant="destructive"
                className="dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </Button>
            )}
            <Button
              type="submit"
              className="dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {event?.id ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Partial<Event> | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [metrics, setMetrics] = useState({
    todayEvents: 0,
    weekEvents: 0,
    monthEvents: 0,
    upcomingEvents: 0,
  })

  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const { streamId, loading: streamLoading } = useCurrentStream()
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    getSession()
  }, [])

  useEffect(() => {
    try {
      if (!streamId || streamLoading) {
        return
      }

      setLoading(true)
      fetchEvents()

      // Clear events and metrics when switching streams
      return () => {
        setEvents([])
        setMetrics({
          todayEvents: 0,
          weekEvents: 0,
          monthEvents: 0,
          upcomingEvents: 0
        })
        setLoading(true)
      }
    } catch (error) {
      console.error('Error in calendar effect:', error)
      toast.error('Failed to initialize calendar')
    }
  }, [streamId, streamLoading])

  useEffect(() => {
    updateMetrics(events)
  }, [events])

  const fetchEvents = async () => {
    if (!streamId) return

    try {
      setLoading(true)
      setEvents([])

      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('stream_id', streamId)
        .order('start_time', { ascending: true })

      if (error) throw error

      setEvents((events || []).map(event => ({
        ...event,
        event_type: event.event_type as EventType | null
      })))
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const updateMetrics = (events: Event[]) => {
    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const getTodayEvents = () => {
      const today = new Date()
      return events.filter((event) =>
        isWithinInterval(parseISO(event.start_time), {
          start: startOfDay(today),
          end: endOfDay(today),
        })
      )
    }

    const getWeekEvents = () => {
      const today = new Date()
      return events.filter((event) =>
        isWithinInterval(parseISO(event.start_time), {
          start: startOfWeek(today),
          end: endOfWeek(today),
        })
      )
    }

    const getMonthEvents = () => {
      const today = new Date()
      return events.filter((event) =>
        isWithinInterval(parseISO(event.start_time), {
          start: startOfMonth(today),
          end: endOfMonth(today),
        })
      )
    }

    const todayEvents = getTodayEvents().length
    const thisWeekEvents = getWeekEvents().length
    const thisMonthEvents = getMonthEvents().length

    setMetrics({
      todayEvents,
      weekEvents: thisWeekEvents,
      monthEvents: thisMonthEvents,
      upcomingEvents: events.length,
    })
  }

  const handleEventSave = async (event: Partial<Event>) => {
    try {
      if (!streamId) {
        toast.error('Please select a revenue stream first')
        return
      }

      if (event.id) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title: event.title || '',
            description: event.description,
            start_time: event.start_time || new Date().toISOString(),
            end_time: event.end_time || new Date().toISOString(),
            all_day: event.all_day || false,
            event_type: (event.event_type as EventType) || 'meeting',
            user_id: session?.user?.id
          })
          .eq('id', event.id)

        if (error) throw error
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert({
            title: event.title || '',
            description: event.description,
            start_time: event.start_time || new Date().toISOString(),
            end_time: event.end_time || new Date().toISOString(),
            all_day: event.all_day || false,
            event_type: event.event_type || 'meeting',
            stream_id: streamId,
            user_id: session?.user.id,
          })

        if (error) throw error
      }

      toast.success(event.id ? 'Event updated' : 'Event created')
      await fetchEvents()
      setIsEventDialogOpen(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save event')
    }
  }

  const handleEventDelete = async () => {
    if (!selectedEvent?.id) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id)

      if (error) throw error

      toast.success('Event deleted')
      await fetchEvents()
      setIsEventDialogOpen(false)
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Error deleting event')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.todayEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week's Events</CardTitle>
            <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.weekEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Events</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.monthEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.upcomingEvents}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-6">
        <div className="flex-1 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Calendar</h1>
            <div className="flex items-center gap-4">
              {loading && (
                <div className="text-sm text-muted-foreground">
                  Loading events...
                </div>
              )}
              <Button onClick={() => setIsEventDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span>Add Event</span>
              </Button>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .fc {
            --fc-border-color: rgb(229 231 235);
            --fc-button-text-color: rgb(75 85 99);
            --fc-button-bg-color: rgb(255 255 255);
            --fc-button-border-color: rgb(209 213 219);
            --fc-button-hover-bg-color: rgb(243 244 246);
            --fc-button-hover-border-color: rgb(209 213 219);
            --fc-button-active-bg-color: rgb(249 250 251);
            --fc-button-active-border-color: rgb(209 213 219);
            --fc-event-bg-color: rgb(249 115 22);
            --fc-event-border-color: rgb(249 115 22);
            --fc-event-text-color: rgb(255 255 255);
            --fc-today-bg-color: rgb(255 237 213);
            --fc-list-event-hover-bg-color: rgb(243 244 246);
          }

          .dark .fc {
            --fc-border-color: rgb(51 65 85);
            --fc-button-text-color: rgb(209 213 219);
            --fc-button-bg-color: rgb(31 41 55);
            --fc-button-border-color: rgb(51 65 85);
            --fc-button-hover-bg-color: rgb(55 65 81);
            --fc-button-hover-border-color: rgb(75 85 99);
            --fc-button-active-bg-color: rgb(75 85 99);
            --fc-button-active-border-color: rgb(107 114 128);
            --fc-page-bg-color: rgb(17 24 39);
            --fc-neutral-bg-color: rgb(31 41 55);
            --fc-neutral-text-color: rgb(229 231 235);
            --fc-today-bg-color: rgba(249, 115, 22, 0.1);
            --fc-list-event-hover-bg-color: rgb(31 41 55);
            --fc-non-business-color: rgb(17 24 39);
            --fc-bg-event-color: rgb(249 115 22);
            --fc-bg-event-opacity: 0.1;
          }

          .dark .fc-theme-standard td,
          .dark .fc-theme-standard th,
          .dark .fc-theme-standard .fc-scrollgrid {
            border-color: rgb(51 65 85);
          }

          .dark .fc-day-today {
            background: rgba(249, 115, 22, 0.1) !important;
          }

          .dark .fc-day-today .fc-daygrid-day-number {
            color: rgb(249 115 22);
            font-weight: 600;
          }

          .dark .fc-col-header-cell {
            background: rgb(31 41 55);
            color: rgb(209 213 219);
            border-color: rgb(51 65 85);
          }

          .dark .fc-daygrid-day-number {
            color: rgb(209 213 219);
          }

          .dark .fc-daygrid-day-frame {
            background: rgb(17 24 39);
          }

          .dark .fc-timegrid-slot {
            background: rgb(17 24 39);
            border-color: rgb(51 65 85);
          }

          .dark .fc-timegrid-slot-label {
            color: rgb(209 213 219);
            border-color: rgb(51 65 85);
          }

          .dark .fc-list-day-cushion {
            background: rgb(31 41 55) !important;
            color: rgb(209 213 219) !important;
          }

          .dark .fc-list-event:hover td {
            background: rgb(31 41 55) !important;
          }

          .dark .fc-list-event-time,
          .dark .fc-list-event-title {
            color: rgb(209 213 219);
          }

          .dark .fc-list-table td {
            border-color: rgb(51 65 85);
          }

          .dark .fc-toolbar-title {
            color: rgb(209 213 219);
          }

          .dark .fc-button {
            background: rgb(31 41 55) !important;
            border-color: rgb(51 65 85) !important;
            color: rgb(209 213 219) !important;
          }

          .dark .fc-button:hover {
            background: rgb(55 65 81) !important;
            border-color: rgb(75 85 99) !important;
          }

          .dark .fc-button-active {
            background: rgb(75 85 99) !important;
            border-color: rgb(107 114 128) !important;
          }

          .dark .fc-event {
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }

          .dark .fc-more-popover {
            background: rgb(31 41 55);
            border-color: rgb(51 65 85);
          }

          .dark .fc-more-popover .fc-popover-title {
            background: rgb(31 41 55);
            color: rgb(209 213 219);
            border-bottom: 1px solid rgb(51 65 85);
          }

          .dark .fc-daygrid-more-link {
            color: rgb(249 115 22);
          }

          .dark .fc-popover-body {
            background: rgb(17 24 39);
          }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          events={events.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.start_time,
            end: event.end_time,
            allDay: event.all_day,
            className: `${event.event_type ? colorMap[event.event_type] : colorMap.meeting} shadow-sm rounded-md`,
          }))}
          eventClick={(info: any) => {
            try {
              const event = events.find((e) => e.id === info.event.id)
              if (event) {
                setSelectedEvent(event)
                setIsEventDialogOpen(true)
              }
            } catch (error) {
              console.error('Error handling event click:', error)
              toast.error('Failed to open event details')
            }
          }}
          eventResize={async (resizeInfo) => {
            try {
              const event = events.find((e) => e.id === resizeInfo.event.id);
              if (event) {
                await handleEventSave({
                  ...event,
                  start_time: resizeInfo.event.startStr,
                  end_time: resizeInfo.event.endStr,
                });
              }
            } catch (error) {
              console.error('Error handling event resize:', error)
              toast.error('Failed to update event')
            }
          }}
          height="auto"
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List',
          }}
          buttonIcons={{
            prev: 'chevron-left',
            next: 'chevron-right',
          }}
          views={{
            dayGrid: {
              titleFormat: { year: 'numeric', month: 'long' },
            },
            timeGrid: {
              titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
            },
            list: {
              titleFormat: { year: 'numeric', month: 'long' },
            },
          }}
          themeSystem="standard"
          dayMaxEvents={true}
          slotMinTime="06:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={true}
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          firstDay={1}
          weekNumbers={true}
          weekNumberFormat={{ week: 'numeric' }}
          dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true }}
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
          }}
        />
      </div>

      <EventDialog
        event={selectedEvent}
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onSave={handleEventSave}
        onDelete={selectedEvent?.id ? handleEventDelete : undefined}
      />
    </div>
  );
}


