import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
} from "@material-tailwind/react";

import { ChevronDown } from "lucide-react";
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
} from "@heroicons/react/24/outline";


import React, { useState, Fragment } from "react";

const menuItems = [
  {
    title: "System",
    items: [
      {
        title: "Indstillinger",
        description: "Systemindstillinger",
        icon: Cog6ToothIcon,
        href: "/dashboard/settings",
      },
      {
        title: "Økonomi",
        description: "Håndter betalinger og fakturering",
        icon: CurrencyDollarIcon,
        href: "/dashboard/admin/finance",
      },
    ],
  },
];

const AdminMegaMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Fragment>
      <Menu open={isMenuOpen} handler={setIsMenuOpen}>
        <MenuHandler>
          <button className="flex items-center gap-2">
            Admin <ChevronDown className="w-4 h-4" />
          </button>
        </MenuHandler>
        <MenuList
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          {menuItems.map((section) => (
            <Fragment key={section.title}>
              <MenuItem
  disabled
  className="font-bold opacity-70 cursor-default select-text"
  placeholder={undefined}
  onPointerEnterCapture={undefined}
  onPointerLeaveCapture={undefined}
>
                {section.title}
              </MenuItem>
              {section.items.map((item) => (
                <MenuItem
  key={item.title}
  className="flex items-center gap-2"
  onClick={() => setIsMenuOpen(false)}
  placeholder={undefined}
  onPointerEnterCapture={undefined}
  onPointerLeaveCapture={undefined}
>
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                </MenuItem>
              ))}
            </Fragment>
          ))}
        </MenuList>
      </Menu>
    </Fragment>
  );
};

export default AdminMegaMenu;