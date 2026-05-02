import Link from 'next/link';
import { 
  MousePointerClick, 
  BarChart3, 
  Smartphone, 
  Zap, 
  ChevronRight, 
  ArrowRight,
  Globe,
  ShieldCheck,
  Layout
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header / Nav */}
      <nav className="flex items-center justify-between px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Zap className="text-patagonia-gold w-6 h-6 fill-patagonia-gold" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Click</span>
        </div>
        <Link href="/app" className="btn-primary text-xs uppercase tracking-widest px-8">
          Acceso Partner
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-12 pb-24 max-w-7xl mx-auto w-full text-center space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-patagonia-gold/10 border border-patagonia-gold/20 text-patagonia-gold">
          <Layout className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-widest font-black">Digital Authority Engine</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] italic">
          MENÚS DIGITALES <br />
          <span className="text-patagonia-gold">MEDIBLES.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
          Transforma tus enlaces en activos estratégicos. Páginas móviles de alto impacto con métricas en tiempo real para marcas que dominan el mercado.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
          <Link href="https://wa.me/56995684198" className="btn-primary py-5 px-12 text-sm uppercase tracking-[0.2em] w-full md:w-auto">
            Activar mi Canal
          </Link>
          <Link href="#que-es" className="btn-outline py-5 px-12 text-sm uppercase tracking-[0.2em] w-full md:w-auto">
            Ver Beneficios
          </Link>
        </div>
      </section>

      {/* Benefits Grid */}
      <section id="que-es" className="bg-patagonia-gray py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter">EL PODER DE LA MEDICIÓN.</h2>
            <p className="text-gray-500">No solo creamos enlaces, creamos inteligencia de negocio.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-premium group">
              <div className="w-14 h-14 bg-patagonia-gold/20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <Smartphone className="text-patagonia-dark w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Diseño Mobile-First</h3>
              <p className="text-gray-500 font-light leading-relaxed">Optimizamos la experiencia de tus clientes en el dispositivo que más usan. Rápido, limpio y elegante.</p>
            </div>

            <div className="card-premium group">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <BarChart3 className="text-patagonia-gold w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Analytics en Vivo</h3>
              <p className="text-gray-500 font-light leading-relaxed">Mide cada clic, cada visita y cada origen de tráfico. Toma decisiones basadas en datos reales, no en intuiciones.</p>
            </div>

            <div className="card-premium group">
              <div className="w-14 h-14 bg-patagonia-gold/20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <Globe className="text-patagonia-dark w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Presencia de Élite</h3>
              <p className="text-gray-500 font-light leading-relaxed">Eleva la percepción de tu marca con una interfaz profesional que proyecta autoridad y confianza inmediata.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-24 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-black italic tracking-tighter leading-tight">PREPARADO PARA <br /> CUALQUIER ESCENARIO.</h2>
            <div className="space-y-6">
              {[
                { title: "Restaurantes", desc: "Menús digitales interactivos con pedidos a un clic." },
                { title: "Profesionales", desc: "Agendamiento de horas y portafolio de servicios." },
                { title: "E-commerce", desc: "Ofertas relámpago y catálogos de WhatsApp." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-3xl bg-gray-50 hover:bg-patagonia-gold/5 transition-all group">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:text-patagonia-gold">
                    <CheckCircle i={i} />
                  </div>
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square bg-gray-100 rounded-[4rem] overflow-hidden border-8 border-white shadow-2xl">
             <div className="absolute inset-0 flex items-center justify-center text-patagonia-gold/10">
                <Zap className="w-64 h-64 fill-current" />
             </div>
             <div className="absolute bottom-12 left-12 right-12 p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg animate-float">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-black rounded-full" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-tighter">Ruta9 Burger</p>
                    <p className="text-[10px] text-gray-400 italic">Clics totales: 45,201</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-10 w-full bg-patagonia-gold rounded-xl" />
                  <div className="h-10 w-full bg-gray-100 rounded-xl" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-black text-white py-32 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter">¿LISTO PARA TOMAR EL CONTROL?</h2>
          <p className="text-xl text-gray-400 font-light">Deja de adivinar qué botones funcionan. Empieza a medir con PatagoniaCoach Click.</p>
          <Link href="https://wa.me/56995684198" className="inline-flex items-center gap-4 px-12 py-6 bg-patagonia-gold text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all">
            Hablar con un Estratega <ArrowRight className="w-6 h-6" />
          </Link>
          <div className="pt-20 opacity-20 flex flex-col items-center gap-4">
             <div className="w-12 h-1 w-20 bg-white rounded-full" />
             <p className="text-[10px] uppercase tracking-[0.4em] font-black">Una división de Agencia PatagoniaCoach</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CheckCircle({ i }: { i: number }) {
  return (
    <div className="w-5 h-5 border-2 border-current rounded-full flex items-center justify-center p-0.5">
      <div className="w-full h-full bg-current rounded-full" />
    </div>
  );
}
