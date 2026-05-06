'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function EnglishPrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-emerald-500/20">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/en" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors font-black text-xs uppercase tracking-widest mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
            <Shield size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none space-y-8 text-lg font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-white mb-4">1. Data Collection and Usage</h2>
            <p>
              Orjut AgTech OS ("the Service") collects data regarding your lands, financial transactions, and inventory to optimize your farming operations. 
              This data is securely stored on Supabase infrastructure and is used solely to provide services and generate analysis (NDVI, AI Consulting) for you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">2. Account Security</h2>
            <p>
              Login operations are performed through Supabase Auth using phone numbers or Google OAuth. 
              User passwords are never stored in plain text and are protected by industry-standard encryption methods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">3. Third-Party Sharing</h2>
            <p>
              Your data is never sold or shared with third parties, except as required by law. 
              Users in the Engineer (Consultant) role can only access your data if you give explicit approval.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">4. Cookies</h2>
            <p>
              Our system uses essential cookies to keep your session active and remember your preferences. 
              These cookies are not used for advertising or tracking purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">5. Contact</h2>
            <p>
              For questions about our privacy policy, you can reach us at <strong>support@orjut.com</strong>.
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
