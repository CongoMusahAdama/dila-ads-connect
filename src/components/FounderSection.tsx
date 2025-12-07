import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const FounderSection = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-background">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="relative aspect-[3/4] max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <img
                                src="/uploads/image copy.png"
                                alt="Fadila Musah - CEO & Founder"
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop";
                                }}
                            />
                            <div className="absolute bottom-6 left-6 z-20 text-white">
                                <p className="text-lg font-medium text-white/90">Founder & CEO</p>
                                <h3 className="text-3xl font-bold">Fadila Musah</h3>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary rounded-full blur-2xl opacity-40 z-0" />
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary rounded-full blur-2xl opacity-40 z-0" />
                    </motion.div>

                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full lg:w-1/2 space-y-8"
                    >
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-orange-500 mb-6">
                                Meet the Founder
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Driving the vision of DilaAds, Fadila Musah is dedicated to revolutionizing the billboard advertising industry in Ghana. As CEO and Founder, she oversees the overall operations, ensuring that both billboard owners and advertisers experience a seamless, transparent, and efficient marketplace.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                                "Our mission is to connect brands with visibility in the most accessible way possible, leveraging technology to bridge the gap between traditional advertising and modern efficiency."
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Get in Touch</h3>
                            <div className="flex flex-col gap-3">
                                <a href="mailto:ceo@dilaads.com" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <span>ceo@dilaads.com</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default FounderSection;
