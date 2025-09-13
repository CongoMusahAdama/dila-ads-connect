import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();
  const steps = [
    {
      number: "01",
      title: "Search",
      description: "Browse available billboards by location, size, and price. Use our search filters to find the perfect advertising space for your campaign needs."
    },
    {
      number: "02",
      title: "Connect",
      description: "Contact billboard owners directly to discuss terms, availability, and campaign requirements. Get instant responses and negotiate the best deals."
    },
    {
      number: "03",
      title: "Book",
      description: "Secure your billboard space with our streamlined booking process. Confirm dates, make payments, and launch your advertising campaign with confidence."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">OUR PROCESS</h2>
          <p className="text-xl text-white/80">how we do it</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="mb-6">
                <span className={`text-6xl lg:text-7xl font-bold ${
                  index === 1 ? 'text-purple-400' : 'text-white'
                }`}>
                  {step.number}
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-white">{step.title}</h3>
              <p className="text-white/70 text-sm lg:text-base leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            onClick={() => navigate('/login')}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 text-lg"
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;