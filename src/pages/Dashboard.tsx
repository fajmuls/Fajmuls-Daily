import { format } from 'date-fns';
import { useAppContext } from '../store';
import { ArrowRight, Wallet, NotebookPen } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { notes, financeRecords } = useAppContext();
  
  const todayDate = format(new Date(), 'EEEE, MMMM do, yyyy');

  const totalFinance = financeRecords.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-stone-900">
          Good day.
        </h1>
        <p className="text-xl text-stone-500 font-medium tracking-wide">
          {todayDate}
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        {/* Finance Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-stone-100 rounded-2xl">
              <Wallet className="w-6 h-6 text-stone-700" />
            </div>
            <Link to="/finance" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-2">Net Balance</p>
            <h2 className="text-4xl font-bold font-serif">
              ${totalFinance.toFixed(2)}
            </h2>
            <p className="text-stone-500 mt-2">{financeRecords.length} records this month</p>
          </div>
        </div>

        {/* Notes Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-stone-100 rounded-2xl">
              <NotebookPen className="w-6 h-6 text-stone-700" />
            </div>
            <Link to="/notes" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-2">Total Notes</p>
            <h2 className="text-4xl font-bold font-serif flex items-baseline gap-2">
              {notes.length} <span className="text-xl text-stone-400 font-sans font-normal">entries</span>
            </h2>
            <p className="text-stone-500 mt-2">Personal, IG, Workout & Prayers</p>
          </div>
        </div>
      </section>
    </div>
  );
}
