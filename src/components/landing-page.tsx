import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import ChaiPaaniLogo from "../assets/ed44a61a321c772f05e626fe7aae98312671f4e9.png";
import ChaiPaaniLogoFull from "../assets/chaipaani_logo.png";
import { motion } from "motion/react";
import { 
  Users, 
  Calculator, 
  Bell, 
  Smartphone, 
  Split, 
  IndianRupee,
  ArrowRight,
  Check,
  Menu,
  X,
  Play
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Split,
      title: "Smart Splitting",
      description: "Split bills equally, by percentage, or exact amounts with ease.",
    },
    {
      icon: Calculator,
      title: "Real-time Calculations",
      description: "Instant updates on who owes what with smart calculations.",
    },
    {
      icon: Bell,
      title: "Gentle Reminders",
      description: "Friendly notifications without awkward conversations.",
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Add expenses and snap receipts on the go.",
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Create a Group",
      description: "Add your friends, family, or roommates to start tracking shared expenses together.",
      icon: Users
    },
    {
      step: "2", 
      title: "Add Expenses",
      description: "Snap a photo of the receipt or manually enter expenses. Choose how to split the cost.",
      icon: IndianRupee
    },
    {
      step: "3",
      title: "Settle Up",
      description: "See simplified debts and settle up with friends through UPI, bank transfer, or cash.",
      icon: Check
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {/* Mobile Logo - icon only */}
              <img 
                src={ChaiPaaniLogo} 
                alt="ChaiPaani Logo" 
                className="h-10 w-10 md:hidden"
              />
              {/* Desktop Logo - full wordmark */}
              <img 
                src={ChaiPaaniLogoFull} 
                alt="ChaiPaani Logo" 
                className="h-15 w-auto hidden md:block"
              />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={onGetStarted}>
                Login
              </Button>
              <Button onClick={onGetStarted}>
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t py-4 space-y-4">
              <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="ghost" onClick={onGetStarted} className="w-full">
                  Login
                </Button>
                <Button onClick={onGetStarted} className="w-full">
                  Sign Up
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-3 space-y-6 md:space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                  <span className="text-primary not-italic font-bold">Sirf chai pe charcha,</span><br />
                  <span className="text-secondary">hisaab pe nahi.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  Split expenses effortlessly with friends and family. Track who owes what, settle up with ease, and keep relationships money-stress-free.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Button size="lg" onClick={onGetStarted} className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                  Start Splitting
                  <ArrowRight className="w-4 md:w-5 h-4 md:h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
                  onClick={() => {
                    window.open("https://www.youtube.com/watch?v=oHg5SJYRHA0", "_blank");
                  }}
                >
                  <Play className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              {/* Main App Mockup */}
              <Card className="shadow-2xl border-2">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="w-4 h-4 text-primary" />
                      Weekend Gang
                    </CardTitle>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      4 members
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">🍕</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Pizza Party</p>
                        <p className="text-xs text-muted-foreground">Paid by Rahul</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₹1,600</p>
                      <p className="text-xs text-green-600">+₹400</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">🎬</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Movie Tickets</p>
                        <p className="text-xs text-muted-foreground">You paid</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₹800</p>
                      <p className="text-xs text-orange-600">-₹200</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground">Net Balance</span>
                      <span className="font-bold text-lg text-primary">+₹200</span>
                    </div>
                    <Button className="w-full" size="sm">
                      <IndianRupee className="w-3.5 h-3.5 mr-1.5" />
                      Settle Up
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Icon Grid */}
      <section id="features" className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center space-y-3 mb-10 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Everything you need to split expenses
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              From quick coffee runs to elaborate vacation planning, ChaiPaani makes splitting expenses simple and stress-free.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center space-y-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                    index % 2 === 0 
                      ? 'bg-gradient-to-br from-primary to-primary/80' 
                      : 'bg-gradient-to-br from-secondary to-secondary/80'
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base md:text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section - Compact and Minimal */}
      <section id="how-it-works" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center space-y-3 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              How ChaiPaani Works
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes. It's as easy as sharing chai with friends.
            </p>
          </motion.div>

          {/* Compact Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center text-center space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {/* Icon with number badge */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {step.step}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-1">
                    <h3 className="text-base md:text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button size="lg" onClick={onGetStarted}>
              Try it yourself
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer - Right-aligned with About Section */}
      <footer className="border-t bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left - Logo */}
            <div className="flex justify-center md:justify-start">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:opacity-80 transition-opacity"
              >
                <img 
                  src={ChaiPaaniLogoFull} 
                  alt="ChaiPaani Logo" 
                  className="h-24 w-auto"
                />
              </button>
            </div>

            {/* Right - About Section */}
            <div className="space-y-4 text-center md:text-right">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md ml-auto">
                  ChaiPaani is a personal project built with the vision of making expense splitting as natural as sharing chai with friends.
                </p>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Built with <span className="text-red-500">❤️</span> in India by <span className="text-foreground font-medium">Sahil Sharma</span>
              </div>

              <div className="text-sm text-muted-foreground">
                Find me on{" "}
                <a 
                  href="https://www.linkedin.com/in/sahil-sharma-5a3715270/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  LinkedIn
                </a>
                {" "}and{" "}
                <a 
                  href="https://github.com/phnxsahil" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Copyright - Full Width */}
          <div className="border-t mt-8 pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 ChaiPaani. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
