'use client';

import { Building2, Package, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useAdminCorporateCompanyDetail,
  useAdminCorporateCompanyOrders,
  useAdminCorporateCompanyInvoices,
} from '@/api/hooks/useAdminCorporate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye } from 'lucide-react';

interface CompanyDetailTabsProps {
  companyId: string;
}

export function CompanyDetailTabs({ companyId }: CompanyDetailTabsProps) {
  const { data: company, isLoading } = useAdminCorporateCompanyDetail(companyId);
  const { data: ordersData, isLoading: ordersLoading } = useAdminCorporateCompanyOrders(companyId, { page: 1, limit: 10 });
  const { data: invoicesData, isLoading: invoicesLoading } = useAdminCorporateCompanyInvoices(companyId, { page: 1, limit: 10 });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-lg rounded-full" />
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        Company not found
      </div>
    );
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="rounded-full bg-muted/60 p-1 flex-wrap h-auto gap-1">
        <TabsTrigger
          value="profile"
          className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Building2 className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger
          value="orders"
          className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Package className="h-4 w-4" />
          Orders
        </TabsTrigger>
        <TabsTrigger
          value="invoices"
          className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <FileText className="h-4 w-4" />
          Invoices
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company Name</p>
                  <p className="font-medium">{company.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GST Number</p>
                  <p className="font-medium">{company.gst_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PAN Number</p>
                  <p className="font-medium">{company.pan_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <Badge variant={company.active_orders_count > 0 ? 'default' : 'secondary'}>
                    {company.active_orders_count}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delegate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{company.delegate?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-medium">{company.delegate?.designation || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{company.delegate?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{company.delegate?.email || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Street Address</p>
                  <p className="font-medium">{company.billing_address?.street_address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{company.billing_address?.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pincode</p>
                  <p className="font-medium">{company.billing_address?.pincode || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Area / Landmark</p>
                  <p className="font-medium">{company.billing_address?.area_landmark || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">State / Country</p>
                  <p className="font-medium">{company.billing_address?.state_country || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="orders">
        <Card>
          <CardHeader>
            <CardTitle>Company Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center py-8 text-muted-foreground">Loading orders...</div>
            ) : !ordersData?.orders?.length ? (
              <div className="flex justify-center py-8 text-muted-foreground">No orders found</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Outlet</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.order_id}</TableCell>
                        <TableCell>{order.outlet_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>Rs. {order.final_amount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/admin/corporate/orders/${order._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invoices">
        <Card>
          <CardHeader>
            <CardTitle>Company Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex justify-center py-8 text-muted-foreground">Loading invoices...</div>
            ) : !invoicesData?.invoices?.length ? (
              <div className="flex justify-center py-8 text-muted-foreground">No invoices found</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesData.invoices.map((invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{invoice.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>Rs. {invoice.grand_total?.toLocaleString()}</TableCell>
                        <TableCell>
                          {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/admin/corporate/invoices/${invoice._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
