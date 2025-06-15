import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FeaturedBillboards = () => {
  const billboards = [
    {
      id: 1,
      location: "Accra",
      details: "Accra +20x10",
      image: "https://images.unsplash.com/photo-1486938289607-e9573fc25ebb?w=400&h=250&fit=crop",
      available: true
    },
    {
      id: 2,
      location: "Kumasi",
      details: "20x10 • Static",
      image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=400&h=250&fit=crop",
      available: true
    },
    {
      id: 3,
      location: "Takoradi",
      details: "Static • Static",
      image: "https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=400&h=250&fit=crop",
      available: true
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-foreground">Featured Billboards</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {billboards.map((billboard) => (
            <Card key={billboard.id} className="overflow-hidden">
              <CardHeader className="p-0 relative">
                <img 
                  src={billboard.image} 
                  alt={`Billboard in ${billboard.location}`}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">
                  Available
                </Badge>
              </CardHeader>
              
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2">{billboard.location}</h3>
                <p className="text-muted-foreground">{billboard.details}</p>
              </CardContent>
              
              <CardFooter className="p-6 pt-0">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBillboards;