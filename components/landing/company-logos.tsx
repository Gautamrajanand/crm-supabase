import Image from 'next/image'
import { motion } from 'framer-motion'
import { Marquee } from '@/components/ui/magic/marquee'

const companies = [
  {
    name: 'Microsoft',
    logo: '/logos/microsoft.svg'
  },
  {
    name: 'Google',
    logo: '/logos/google.svg'
  },
  {
    name: 'Amazon',
    logo: '/logos/amazon.svg'
  },
  {
    name: 'Meta',
    logo: '/logos/meta.svg'
  },
  {
    name: 'Apple',
    logo: '/logos/apple.svg'
  },
  {
    name: 'Netflix',
    logo: '/logos/netflix.svg'
  },
  {
    name: 'Adobe',
    logo: '/logos/adobe.svg'
  },
  {
    name: 'Salesforce',
    logo: '/logos/salesforce.svg'
  },
  {
    name: 'Twitter',
    logo: '/logos/twitter.svg'
  },
  {
    name: 'Spotify',
    logo: '/logos/spotify.svg'
  },
  {
    name: 'Uber',
    logo: '/logos/uber.svg'
  },
  {
    name: 'Airbnb',
    logo: '/logos/airbnb.svg'
  },
  {
    name: 'Stripe',
    logo: '/logos/stripe.svg'
  },
  {
    name: 'Square',
    logo: '/logos/square.svg'
  },
  {
    name: 'Slack',
    logo: '/logos/slack.svg'
  },
  {
    name: 'Zoom',
    logo: '/logos/zoom.svg'
  },
  {
    name: 'Intel',
    logo: '/logos/intel.svg'
  },
  {
    name: 'IBM',
    logo: '/logos/ibm.svg'
  },
  {
    name: 'Oracle',
    logo: '/logos/oracle.svg'
  },
  {
    name: 'SAP',
    logo: '/logos/sap.svg'
  },
  {
    name: 'Dell',
    logo: '/logos/dell.svg'
  },
  {
    name: 'HP',
    logo: '/logos/hp.svg'
  },
  {
    name: 'Cisco',
    logo: '/logos/cisco.svg'
  },
  {
    name: 'VMware',
    logo: '/logos/vmware.svg'
  },
  {
    name: 'TechCorp',
    logo: '/logos/techcorp.svg'
  },
  {
    name: 'InnovateLabs',
    logo: '/logos/innovatelabs.svg'
  },
  {
    name: 'GrowthWorks',
    logo: '/logos/growthworks.svg'
  },
  {
    name: 'FutureScale',
    logo: '/logos/futurescale.svg'
  },
  {
    name: 'CloudNine',
    logo: '/logos/cloudnine.svg'
  },
]

export function CompanyLogos() {
  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-black via-gray-900/50 to-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <p className="text-center text-sm font-medium text-gray-400 mb-8">Trusted by innovative teams worldwide</p>
          <div className="relative flex overflow-hidden py-6">
            <div className="flex space-x-12 animate-marquee hover:pause">
              {companies.map((company, i) => (
                <div
                  key={`${company.name}-${i}`}
                  className="flex items-center justify-center min-w-[120px] group"
                >
                  <p className="text-gray-500 group-hover:text-blue-400 transition-colors duration-300 text-sm font-medium">
                    {company.name}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex space-x-12 animate-marquee2 absolute top-0 py-6">
              {companies.map((company, i) => (
                <div
                  key={`${company.name}-${i}-clone`}
                  className="flex items-center justify-center min-w-[120px] group"
                >
                  <p className="text-gray-500 group-hover:text-blue-400 transition-colors duration-300 text-sm font-medium">
                    {company.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
