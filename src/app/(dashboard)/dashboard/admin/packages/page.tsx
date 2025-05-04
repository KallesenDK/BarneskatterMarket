'use client'

import React, { useState } from 'react';
import type { Package } from '@/components/modals/EditPackageModal';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CreatePackageModal, EditPackageModal } from '@/components';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

const PackagesPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);


  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowEditModal(true);
  };

  const handleDelete = (pkg: Package) => {
    // Implement the delete logic here
  };

  const handleSuccess = () => {
    // Implement the success logic here
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Abonnementspakker</h1>
          <p className="text-sm text-muted-foreground">
            Administrer dine abonnementspakker
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Opret Pakke
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NAVN</TableHead>
              <TableHead>VARIGHED</TableHead>
              <TableHead>PRODUKTER</TableHead>
              <TableHead>PRIS</TableHead>
              <TableHead>TILBUD</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">
                  {pkg.name}
                  {pkg.is_popular && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Mest populær
                    </span>
                  )}
                </TableCell>
                <TableCell>{pkg.duration} uger</TableCell>
                <TableCell>{pkg.product_limit} produkter</TableCell>
                <TableCell>{pkg.price} kr.</TableCell>
                <TableCell>
                  {pkg.sale_price ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-red-600">{pkg.sale_end_date ? format(new Date(pkg.sale_end_date || ''), 'dd.MM.yyyy', { locale: da }) : ''}</span>
                      <span className="text-sm font-medium">{pkg.sale_price} kr.</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    pkg.is_active
                      ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                      : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                  )}>
                    {pkg.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Åbn menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(pkg)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Rediger
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(pkg)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Slet
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreatePackageModal 
        show={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={handleSuccess}
      />
      
      <EditPackageModal 
        show={showEditModal} 
        package={selectedPackage} 
        onClose={() => setShowEditModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default PackagesPage; 