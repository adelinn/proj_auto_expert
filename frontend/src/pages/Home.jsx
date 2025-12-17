import Button from "../components/Button";
import Pin from "../components/Pin";
import "./Home.css";

function Home() {
  return (
    <section className="-mt-8 relative min-h-screen">
      {/* Neon lightning blobs background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Blue neon blob */}
        <div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full opacity-80"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.6) 30%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'pulse-blob-blue 8s ease-in-out infinite',
          }}
        />
        {/* Green neon blob */}
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full opacity-70"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.6) 30%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'pulse-blob-green 6s ease-in-out infinite 2s',
          }}
        />
        {/* Purple neon blob */}
        <div
          className="absolute top-1/2 left-1/2 w-[450px] h-[450px] rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.7) 0%, rgba(147, 51, 234, 0.5) 30%, transparent 70%)',
            filter: 'blur(75px)',
            animation: 'pulse-blob-purple 7s ease-in-out infinite 1s',
          }}
        />
        {/* Additional blue accent */}
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.6) 0%, rgba(59, 130, 246, 0.4) 30%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'pulse-blob-blue2 9s ease-in-out infinite 0.5s',
          }}
        />
      </div>
      
      {/* Content with relative positioning */}
      <div className="relative z-10">
        <div>
        <Button className="data-active:ring-2 data-active:ring-white/30 font-bold">A</Button>
        <Button className="data-active:ring-2 data-active:ring-white/30 font-bold">B</Button>
        <Button className="data-active:ring-2 data-active:ring-white/30 font-bold">C</Button>
        <Button className="data-active:ring-2 data-active:ring-white/30 font-bold">D</Button>
        </div>
      <h1>Welcome to Semni</h1>
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <div className="flex items-center gap-2">
        <Button className="data-active:ring-2 data-active:ring-white/30">Asd</Button>
        <Button>Asd</Button>
        <Pin mode="x" size="sm"/>
        <Pin/>
        <Pin mode="check" size="lg"/>
      </div>
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      <p>Your dashboard for managing products and organizing your catalog.</p>
      <br />
      </div>
    </section>
  );
}

export default Home;
