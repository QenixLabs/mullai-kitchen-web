import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat } from 'lucide-react';

export default function RecipesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recipe Management</h1>
        <p className="text-muted-foreground">
          Create and manage recipes, ingredients, and nutritional information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
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
