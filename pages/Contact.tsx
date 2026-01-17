
import React, { useState } from 'react';
import { FAQS } from '../constants';

interface ContactProps {
  onSendTicket: (ticket: { name: string, email: string, message: string }) => void;
}

const Contact: React.FC<ContactProps> = ({ onSendTicket }) => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendTicket(formState);
    setSubmitted(true);
    setFormState({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Left: Contact Info */}
        <div>
          <h1 className="text-4xl md:text-6xl font-gaming font-bold text-white mb-8 tracking-tighter">
            GET IN <span className="text-sky-400 underline decoration-purple-500 underline-offset-8">TOUCH</span>
          </h1>
          <p className="text-slate-400 text-lg mb-12">
            Have questions about an order or a product? Our support team is ready to assist you 24/7.
          </p>

          <div className="space-y-8 mb-16">
            <div className="flex items-start space-x-6">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-gaming text-sm font-bold uppercase tracking-widest mb-1">Email Support</h4>
                <p className="text-slate-400">Direct response within 12 hours</p>
                <a href="mailto:grosafzemb@gmail.com" className="text-sky-400 font-bold hover:underline">grosafzemb@gmail.com</a>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <i className="fab fa-discord text-2xl text-purple-400"></i>
              </div>
              <div>
                <h4 className="text-white font-gaming text-sm font-bold uppercase tracking-widest mb-1">Discord Community</h4>
                <p className="text-slate-400">Real-time support & giveaways</p>
                <a href="https://discord.gg/eF9W6C6q" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold hover:underline">Join 15k+ Members</a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-gaming font-bold text-white uppercase">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h5 className="text-white font-bold mb-2">{faq.question}</h5>
                  <p className="text-slate-400 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[60px]" />
          <div className="relative z-10">
            <h3 className="text-2xl font-gaming font-bold text-white mb-8 uppercase tracking-widest">Send a Message</h3>
            
            {submitted ? (
              <div className="py-20 text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Message Sent!</h4>
                <p className="text-slate-400">Our admin team has received your ticket.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-slate-400 text-xs font-gaming uppercase tracking-widest mb-2">Your Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="Enter your name"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-gaming uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    required
                    type="email" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="john@example.com"
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-gaming uppercase tracking-widest mb-2">Message</label>
                  <textarea 
                    required
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="How can we help?"
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-sky-500 text-white font-gaming font-bold py-5 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:bg-sky-600 transition-all flex items-center justify-center space-x-2"
                >
                  <span>SEND TRANSMISSION</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
