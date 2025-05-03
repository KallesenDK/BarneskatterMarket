'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
} from "@material-tailwind/react"
import { ChevronDown } from 'lucide-react'
import {
  UserGroupIcon,
  ShoppingCartIcon,
  Cog6ToothIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TagIcon,
  BuildingStorefrontIcon,
  CubeIcon,
} from "@heroicons/react/24/solid"

const menuItems = [
  {
    title: "Brugere & Ordrer",
    items: [
      {
        title: "Håndter Brugere",
        description: "Administrer systemets brugere",
        icon: UserGroupIcon,
        href: "/dashboard/admin/users"
      },
      {
        title: "Ordrer",
        description: "Se og håndter alle ordrer",
        icon: ShoppingCartIcon,
        href: "/dashboard/admin/orders"
      },
      {
        title: "Beskeder",
        description: "Håndter kommunikation",
        icon: ChatBubbleLeftIcon,
        href: "/dashboard/admin/messages"
      },
    ]
  },
  {
    title: "Produkter & Pakker",
    items: [
      {
        title: "Pakker",
        description: "Håndter produktpakker",
        icon: CubeIcon,
        href: "/dashboard/packages"
      },
      {
        title: "Ekstra produkter",
        description: "Administrer produktslots",
        icon: TagIcon,
        href: "/dashboard/admin/product-slots"
      },
    ]
  },
  {
    title: "System",
    items: [
      {
        title: "Indstillinger",
        description: "Systemindstillinger",
        icon: Cog6ToothIcon,
        href: "/dashboard/settings"
      },
      {
        title: "Økonomi",
        description: "Håndter betalinger og fakturering",
        icon: CurrencyDollarIcon,
        href: "/dashboard/admin/finance"
      },
    ]
  }
]

export default function AdminMegaMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={true}
      >
        <MenuHandler>
          <Typography as="div" variant="small" className="font-medium">
            <button
              className="flex items-center gap-2 py-3 px-4 font-medium text-gray-900 hover:text-[#BC1964] transition-colors"
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              Admin
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </Typography>
        </MenuHandler>
        <MenuList className="hidden max-w-screen-xl rounded-xl lg:block shadow-lg">
          <div className="grid grid-cols-3 gap-8 p-6 bg-white">
            {menuItems.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <Typography variant="h6" color="blue-gray" className="text-sm font-semibold text-gray-900 text-left">
                  {section.title}
                </Typography>
                <div className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <Link key={itemIdx} href={item.href}>
                      <MenuItem className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/80 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50/50">
                          {<item.icon className="h-6 w-6 text-[#BC1964]" />}
                        </div>
                        <div className="flex flex-col items-start">
                          <Typography variant="h6" color="blue-gray" className="text-sm font-semibold text-gray-900">
                            {item.title}
                          </Typography>
                          <Typography variant="small" color="gray" className="text-xs font-normal text-gray-600">
                            {item.description}
                          </Typography>
                        </div>
                      </MenuItem>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        {isMobileMenuOpen && (
          <div className="mt-2 space-y-4 px-4">
            {menuItems.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <Typography variant="h6" color="blue-gray" className="text-sm font-semibold text-gray-900 text-left">
                  {section.title}
                </Typography>
                {section.items.map((item, itemIdx) => (
                  <Link key={itemIdx} href={item.href}>
                    <MenuItem className="flex items-start gap-3 rounded-lg hover:bg-gray-50 text-left">
                      <div className="flex items-start justify-start rounded-lg bg-gray-50 p-2">
                        {<item.icon className="h-5 w-5 text-[#BC1964]" />}
                      </div>
                      <div className="flex flex-col items-start">
                        <Typography variant="h6" color="blue-gray" className="text-sm font-semibold text-left">
                          {item.title}
                        </Typography>
                        <Typography variant="small" color="gray" className="text-xs font-normal text-left">
                          {item.description}
                        </Typography>
                      </div>
                    </MenuItem>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Fragment>
  )
} 