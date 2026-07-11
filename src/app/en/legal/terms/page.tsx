'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function EnglishTermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-emerald-500/20">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/en" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors font-black text-xs uppercase tracking-widest mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <FileText size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Terms of Service</h1>
        </div>

        <div className="prose prose-invert prose-blue max-w-none space-y-8 text-lg font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-white mb-4">1. Scope of Service</h2>
            <p>
              Orjut AgTech OS is a SaaS platform providing data management, NDVI satellite analysis, and AI-powered consulting services to increase agricultural productivity. 
              By using the system, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">2. Subscription and Payments</h2>
            <p>
              &quot;KOBI Pro&quot; and &quot;Business&quot; packages operate on an annual subscription model. 
              Payments are securely processed via Sanal POS. In case of cancellation, no refunds are provided for the remaining period, but access remains until the end of the term.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">3. User Responsibilities</h2>
            <p>
              Users are responsible for the accuracy of the data entered into the system. 
              Orjut cannot be held responsible for incorrect analysis or financial losses resulting from erroneous data entry.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">4. Service Availability</h2>
            <p>
              While we target 99.9% uptime, short-term interruptions may occur due to maintenance or force majeure. 
              Planned maintenance will be communicated to users in advance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">5. Intellectual Property</h2>
            <p>
              All rights to the software belong to Orjut. Any copying, reverse engineering, or unauthorized distribution of the software is subject to legal action.
            </p>
          </section>
        </div>
        
        <div className="mt-24 pt-12 border-t border-white/5 text-center">
          <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Last Updated: May 6, 2026</p>
        </div>
      </div>
    </div>
  );
}
