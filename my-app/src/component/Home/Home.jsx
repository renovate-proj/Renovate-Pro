"use client";

import React from "react";
import {
  Calendar,
  Clock,
  FileText,
  User,
  Ruler,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function RenovateProLanding() {
  const router = useRouter();
  const { user } = useAuth();
  const features = [
    {
      icon: <Ruler className="w-8 h-8" />,
      title: "Precision Measurements",
      description:
        "Laser-accurate measurements ensuring your renovation plans are perfect",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Digital Blueprints",
      description: "CAD-quality digital blueprints delivered in multiple formats",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Fast Turnaround",
      description: "Receive your detailed blueprints within 24-48 hours",
    },
    {
      icon: <User className="w-8 h-8" />,
      title: "Expert Surveyors",
      description: "Certified professionals with years of experience",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Online Booking",
      description: "Schedule appointments at your convenience, 24/7",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile-Friendly",
      description: "Access your blueprints anywhere, on any device",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Book Online Appointment",
      description:
        "Choose your preferred date and time through our easy booking system",
    },
    {
      number: "02",
      title: "Expert Visits Your Site",
      description:
        "Our certified surveyor arrives on time with professional equipment",
    },
    {
      number: "03",
      title: "Receive Digital Blueprint",
      description:
        "Get detailed CAD blueprints delivered to your email within 48 hours",
    },
    {
      number: "04",
      title: "Start Your Renovation",
      description:
        "Begin your project with confidence using accurate measurements",
    },
  ];

  const trustIndicators = [
    { label: "Serving Mumbai since", value: "2023" },
    { label: "Projects Completed", value: "1000+" },
    { label: "Customer Rating", value: "4.9/5" },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Professional Room Renovation Service
            </h1>
            <p className="text-xl text-gray-600">
              Accurate blueprints for your renovation projects by certified
              professionals.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(user ? "/bookingsurvey" : "/login")}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Book a Survey
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50">
                Learn More
              </button>
            </div>
          </div>

          <div className="bg-blue-100 p-8 rounded-2xl shadow-xl">
            <div className="bg-white p-6 rounded-lg space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-semibold text-gray-500">
                  FLOOR PLAN
                </span>
                <Ruler className="text-blue-600" />
              </div>
              <p>Living Room: 4.2m × 3.8m</p>
              <p>Kitchen: 3.5m × 2.9m</p>
              <p>Bedroom: 3.9m × 3.2m</p>
              <div className="flex items-center text-blue-600 mt-4">
                <CheckCircle className="mr-2" /> Verified Measurements
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 text-center gap-8">
          {trustIndicators.map((item, i) => (
            <div key={i}>
              <div className="text-4xl font-bold">{item.value}</div>
              <div className="text-blue-100">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose RenovatePro?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-8 bg-white shadow-lg rounded-xl hover:shadow-xl"
              >
                <div className="text-blue-600 mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="text-5xl text-blue-100 font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mt-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 mt-2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Start Your Renovation?
        </h2>
        <p className="text-blue-100 mb-8">
          Book a professional survey and receive blueprints within 48 hours.
        </p>
        <button
          onClick={() => router.push(user ? "/bookingsurvey" : "/login")}
          className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold">
          Book Your Survey Now
        </button>
      </section>

    </div>
  );
}
