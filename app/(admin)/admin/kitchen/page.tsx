import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

export default function KitchenPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Kitchen Report</h1>
        <p className="text-muted-foreground">
          View kitchen operations, daily production reports, and cooking schedules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is currently under development. Check back soon for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
