import { UsersRound, BarChart3, Calendar, MessageSquare, Target, Briefcase } from 'lucide-react'

const features = [
  {
    name: "Contact Management",
    description: "Keep track of all your customer interactions and contact information in one place.",
    icon: UsersRound,
  },
  {
    name: "Deal Pipeline",
    description: "Visualize and manage your sales pipeline with customizable deal stages.",
    icon: BarChart3,
  },
  {
    name: "Task Management",
    description: "Stay organized with task tracking and calendar integration.",
    icon: Calendar,
  },
  {
    name: "Team Collaboration",
    description: "Work together seamlessly with shared workspaces and real-time updates.",
    icon: MessageSquare,
  },
  {
    name: "Revenue Streams",
    description: "Track and analyze multiple revenue streams independently.",
    icon: Target,
  },
  {
    name: "Deal Management",
    description: "Close more deals with our intuitive deal management system.",
    icon: Briefcase,
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="container mx-auto px-4 space-y-12 bg-slate-50 py-16 dark:bg-transparent md:py-24 lg:py-32"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-6 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Features
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Everything you need to manage your customer relationships effectively
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:gap-8">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="relative overflow-hidden rounded-lg border bg-background p-2"
          >
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <feature.icon className="h-12 w-12 fill-current" />
              <div className="space-y-2">
                <h3 className="font-bold">{feature.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
