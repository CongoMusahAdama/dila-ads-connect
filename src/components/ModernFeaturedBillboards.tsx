import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, Calendar, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getBillboardImageUrl } from "@/utils/imageUtils";

const ModernFeaturedBillboards = () => {
  const [billboards, setBillboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedBillboards();
  }, []);

  const fetchFeaturedBillboards = async () => {
    try {
      const { data, error } = await supabase
        .from('billboards')
        .select('*')
        .eq('is_available', true)
        .eq('is_approved', true)
        .limit(6)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBillboards(data || []);
    } catch (error) {
      console.error('Error fetching featured billboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (billboard: any) => {
    navigate(`/billboard/${billboard.id}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Most Viewed</h2>
            <p className="text-muted-foreground">Loading featured billboards...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Most Viewed</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover a range of premium billboard locations across Ghana. Book securely and get expert customer support for a stress-free advertising experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {billboards.map((billboard) => (
            <Card key={billboard.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  {billboard.image_url ? (
                    <img 
                      src={getBillboardImageUrl({ imageUrl: billboard.image_url })} 
                      alt={billboard.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No Image Available</p>
                    </div>
                  )}
                </div>
                <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-500">
                  Available
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{billboard.name}</h3>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {billboard.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">GH¢{billboard.price_per_day}</p>
                      <p className="text-sm text-muted-foreground">per day</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {billboard.size || 'Standard Size'}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      4.8
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleViewDetails(billboard)}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-muted rounded-full"></div>
            <div className="w-2 h-2 bg-muted rounded-full"></div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Button 
            onClick={() => navigate('/billboards')}
            variant="outline"
            size="lg"
            className="mr-4"
          >
            View All Billboards
          </Button>
          <Button 
            onClick={() => navigate('/signup')}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            List Your Billboard
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ModernFeaturedBillboards;
