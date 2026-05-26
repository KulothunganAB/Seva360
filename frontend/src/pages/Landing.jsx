import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiAlertCircle, FiTool, FiUsers, FiHeart, FiCalendar, FiMapPin, FiStar, FiChevronDown, FiChevronUp, FiMenu, FiX } from 'react-icons/fi';
import AnimatedCounter from '../components/ui';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const STATS = [
  { label: 'Complaints Resolved', value: 1240, suffix: '+', icon: FiAlertCircle, color: 'text-green-400' },
  { label: 'Works Completed', value: 89, suffix: '', icon: FiTool, color: 'text-blue-400' },
  { label: 'Districts Covered', value: 5, suffix: '', icon: FiUsers, color: 'text-primary-400' },
  { label: 'Donations Raised (₹)', value: 1850000, prefix: '₹', suffix: '', icon: FiHeart, color: 'text-red-400' },
];

const FEATURES = [
  { icon: FiAlertCircle, title: 'Citizen Grievance Portal', desc: 'Submit, track and resolve complaints about roads, water, sanitation and more with real-time status updates.', color: 'from-red-500 to-red-700' },
  { icon: FiTool, title: 'Public Works Tracker', desc: 'Monitor ongoing infrastructure projects in your ward — roads, parks, drainage — with progress updates and budgets.', color: 'from-blue-500 to-blue-700' },
  { icon: FiUsers, title: 'District-Wise Governance', desc: 'Separate admins and citizens per district — Chennai, Coimbatore, Madurai, Trichy and Salem.', color: 'from-primary-500 to-primary-700' },
  { icon: FiHeart, title: 'Charity & Welfare', desc: 'Blood donation, scholarship assistance, food distribution and disaster relief — all in one transparent platform.', color: 'from-pink-500 to-pink-700' },
  { icon: FiCalendar, title: 'Event Management', desc: 'Discover and register for community events, health camps, cleanups and awareness drives near you.', color: 'from-purple-500 to-purple-700' },
  { icon: FiMapPin, title: 'Ward Map & Geo Tracking', desc: 'View complaint hotspots, ongoing works and events on an interactive map of your ward and district.', color: 'from-green-500 to-green-700' },
];

const TESTIMONIALS = [
  { name: 'Priya Lakshmi', role: 'Citizen, Adyar', text: 'My road repair complaint was resolved in just 5 days! Seva360 made it so easy to track everything.', rating: 5 },
  { name: 'District Admin', role: 'Chennai', text: 'Managing events and charity for my district is simple. Citizens see only what matters to them locally.', rating: 5 },
  { name: 'Arjun Murugan', role: 'Citizen, T Nagar', text: 'Finally a platform where I can see exactly where the ward budget is spent. Transparency at its best!', rating: 5 },
];

const FAQS = [
  { q: 'How do I file a complaint?', a: 'Register as a Citizen, go to "File Complaint", fill in the category, description, and location. You\'ll get a ticket number instantly.' },
  { q: 'Who handles my complaints?', a: 'Your district admin reviews and assigns complaints within your district. Track status in real time.' },
  { q: 'How do district admins work?', a: 'Each district has its own admin account. Admins manage complaints, events, and charity only for their district.' },
  { q: 'Is Seva360 affiliated with the government?', a: 'Seva360 is a civic-tech platform designed to bridge citizens and elected representatives. It works as a governance accountability tool.' },
  { q: 'Can I donate to charity campaigns?', a: 'Yes! Visit the Charity section, choose a campaign, and donate. All donations are tracked transparently on the platform.' },
];

const Landing = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    api.get('/admin/announcements').then(r => setAnnouncements(r.data.data?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/90 backdrop-blur-md border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <span className="font-bold text-lg font-poppins text-white">Seva</span>
              <span className="font-bold text-lg font-poppins text-primary-500">360</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-dark-300 hover:text-white transition-colors">Features</a>
            <a href="#impact" className="text-dark-300 hover:text-white transition-colors">Impact</a>
            <a href="#districts" className="text-dark-300 hover:text-white transition-colors">Districts</a>
            <a href="#faq" className="text-dark-300 hover:text-white transition-colors">FAQ</a>
            <Link to="/login" className="btn btn-outline border-primary-600 text-primary-400 hover:bg-primary-700 hover:text-white px-4 py-2 text-sm">Login</Link>
            <Link to="/register" className="btn btn-primary px-4 py-2 text-sm" id="hero-register-btn">Register</Link>
          </div>
          <button className="md:hidden p-2 text-dark-300" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-dark-900 border-t border-dark-800 px-4 py-4 space-y-3">
            {['features', 'impact', 'districts', 'faq'].map(s => (
              <a key={s} href={`#${s}`} className="block text-dark-300 hover:text-white capitalize py-1" onClick={() => setMobileMenu(false)}>{s}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn btn-outline border-primary-600 text-primary-400 flex-1 py-2 text-sm">Login</Link>
              <Link to="/register" className="btn btn-primary flex-1 py-2 text-sm">Register</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary-900/40 border border-primary-700/50 text-primary-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
              Tamil Nadu's Smart Governance Platform
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold font-poppins leading-tight mb-6">
              <span className="text-white">Seva</span>
              <span className="text-primary-400">360</span>
              <br />
              <span className="gradient-text text-4xl md:text-5xl">Smart Governance</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-4">
              Smart Governance • Public Service • Citizen Engagement
            </motion.p>
            <motion.p variants={fadeUp} className="text-dark-400 text-base max-w-xl mx-auto mb-10">
              File complaints, track public works, join events and support charity — district by district across Tamil Nadu.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg shadow-lg shadow-primary-900/40 hover:shadow-primary-900/60 text-base" id="hero-cta-register">
                Get Started Free <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn btn-lg border-2 border-dark-600 hover:border-dark-400 text-dark-300 hover:text-white text-base">
                Sign In to Dashboard
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {STATS.map((s, i) => (
                <div key={i} className="text-center">
                  <div className={`text-3xl font-bold font-poppins ${s.color}`}>
                    {s.prefix}<AnimatedCounter end={s.value} suffix={s.suffix} duration={2000} />
                  </div>
                  <div className="text-dark-400 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-primary-400 text-sm font-semibold uppercase tracking-wider mb-3">Platform Features</motion.p>
            <motion.h2 variants={fadeUp} className="section-title text-white">Everything You Need</motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle">A complete governance ecosystem for citizens and district administrators.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} variants={fadeUp} className="glass-card p-6 hover:border-primary-700/50 transition-all group cursor-default">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2 font-poppins">{f.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="section bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-gold-500 text-sm font-semibold uppercase tracking-wider mb-3">Public Impact</motion.p>
            <motion.h2 variants={fadeUp} className="section-title text-white">Real Change, Real Numbers</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-4 gap-6">
            {[
              { v: '94%', l: 'Complaint Resolution Rate', sub: 'Within 7 days on avg' },
              { v: '₹12L+', l: 'Charity Funds Raised', sub: 'Across 15 campaigns' },
              { v: '540+', l: 'Active Volunteers', sub: 'Singapadai members' },
              { v: '89', l: 'Works Completed', sub: 'Road, drainage, parks' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card p-6 text-center">
                <div className="text-4xl font-extrabold text-primary-400 font-poppins mb-2">{item.v}</div>
                <div className="text-white font-semibold text-sm mb-1">{item.l}</div>
                <div className="text-dark-500 text-xs">{item.sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Districts Section */}
      <section id="districts" className="section bg-gradient-to-br from-primary-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-primary-300 text-sm font-semibold uppercase tracking-wider mb-3">மாவட்ட அடிப்படையில் / District-Wise</motion.p>
              <motion.h2 variants={fadeUp} className="section-title text-white mb-4">Your District, Your Admin</motion.h2>
              <motion.p variants={fadeUp} className="text-blue-200 mb-6">Citizens and admins are separated by district. Each district admin manages complaints, events, and charity for their area only.</motion.p>
              <motion.ul variants={stagger} className="space-y-3 mb-8">
                {['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'].map((item, i) => (
                  <motion.li key={i} variants={fadeUp} className="flex items-center gap-3 text-blue-100 text-sm">
                    <span className="w-5 h-5 bg-primary-500/30 border border-primary-400/40 rounded-full flex items-center justify-center text-primary-200 text-xs flex-shrink-0">✓</span>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div variants={fadeUp} className="flex gap-3">
                <Link to="/register" className="btn btn-primary btn-lg">Register as Citizen <FiArrowRight /></Link>
                <Link to="/login" className="btn btn-outline border-primary-400 text-primary-200 btn-lg">Admin Login</Link>
              </motion.div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="grid grid-cols-2 gap-4">
              {[{ emoji: '📍', v: '30+', l: 'Map Markers' }, { emoji: '📅', v: '15', l: 'Events' }, { emoji: '❤️', v: '10', l: 'Charity Drives' }, { emoji: '📋', v: '30', l: 'Complaints' }].map((s, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <div className="text-3xl mb-2">{s.emoji}</div>
                  <div className="text-2xl font-bold text-white font-poppins">{s.v}</div>
                  <div className="text-blue-300 text-xs mt-1">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-400 text-sm font-semibold uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="section-title text-white">What Citizens Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => <FiStar key={j} className="w-4 h-4 text-gold-500 fill-current" />)}
                </div>
                <p className="text-dark-300 text-sm italic mb-4">"{t.text}"</p>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-dark-500 text-xs">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="section bg-dark-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title text-white">Latest Announcements</h2>
            </div>
            <div className="space-y-4 max-w-3xl mx-auto">
              {announcements.map((a) => (
                <div key={a.id} className="glass-card p-5 flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${a.priority === 'high' ? 'bg-red-500' : 'bg-primary-400'}`} />
                  <div>
                    <h3 className="text-white font-semibold text-sm">{a.title}</h3>
                    <p className="text-dark-400 text-xs mt-1">{a.content}</p>
                    <p className="text-dark-600 text-xs mt-2">{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="section bg-dark-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-white font-medium text-sm">{f.q}</span>
                  {openFaq === i ? <FiChevronUp className="text-primary-400 flex-shrink-0" /> : <FiChevronDown className="text-dark-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-5 pb-5 text-dark-400 text-sm leading-relaxed">
                    {f.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-800 to-primary-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white font-poppins mb-4">Ready to Transform Your Community?</h2>
          <p className="text-primary-200 mb-8">Join citizens and district admins making Tamil Nadu better, one district at a time.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-gold btn-lg" id="cta-register">Register Now <FiArrowRight /></Link>
            <Link to="/login" className="btn btn-lg border-2 border-white/40 text-white hover:bg-white/10">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 border-t border-dark-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center"><span className="text-white font-bold">S</span></div>
                <span className="font-bold text-white font-poppins">Seva360</span>
              </div>
              <p className="text-dark-500 text-xs leading-relaxed">Smart Governance • Public Service • Citizen Engagement</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-dark-500 text-xs">
                {['Grievance Portal', 'Public Works', 'Volunteer System', 'Charity & Welfare'].map(l => <li key={l} className="hover:text-dark-300 cursor-pointer transition-colors">{l}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Roles</h4>
              <ul className="space-y-2 text-dark-500 text-xs">
                {['Citizen Portal', 'Councillor Login', 'Volunteer Login', 'Admin Dashboard'].map(l => <li key={l} className="hover:text-dark-300 cursor-pointer transition-colors">{l}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
              <ul className="space-y-2 text-dark-500 text-xs">
                <li><Link to="/register" className="hover:text-dark-300 transition-colors">Register</Link></li>
                <li><Link to="/login" className="hover:text-dark-300 transition-colors">Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-600 text-xs">© 2026 Seva360. All rights reserved. Built for Tamil Nadu citizens.</p>
            <p className="text-dark-700 text-xs">Powered by React + Node.js</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
