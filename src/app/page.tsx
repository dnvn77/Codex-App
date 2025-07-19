import { AppContainer } from '@/components/AppContainer';
import { Chatbot } from '@/components/shared/Chatbot';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md mx-auto">
        <AppContainer />
      </div>
      <Chatbot />
    </main>
  );
}
