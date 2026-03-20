'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function PaginaVacanta() {
  const params = useParams()
  const [numeVacanta, setNumeVacanta] = useState('Se încarcă...')
  const [activitati, setActivitati] = useState<any[]>([])
  const [nouaOra, setNouaOra] = useState('')
  const [nouaDescriere, setNouaDescriere] = useState('')

  // 1. Încărcăm datele (Numele vacanței + Activitățile)
  async function incarcaTot() {
    // Luăm numele vacanței
    const { data: v } = await supabase.from('vacante').select('nume').eq('id', params.id).single()
    if (v) setNumeVacanta(v.nume)

    // Luăm activitățile pentru ACEST ID de vacanță
    const { data: act } = await supabase
      .from('activitati')
      .select('*')
      .eq('trip_id', params.id)
      .order('ora', { ascending: true })
    
    if (act) setActivitati(act)
  }

  useEffect(() => { incarcaTot() }, [params.id])

  // 2. Funcția care adaugă o activitate
  async function adaugaActivitate(e: React.FormEvent) {
    e.preventDefault()
    if (!nouaOra || !nouaDescriere) return

    const { error } = await supabase.from('activitati').insert([
      { trip_id: params.id, ora: nouaOra, descriere: nouaDescriere }
    ])

    if (!error) {
      setNouaOra(''); setNouaDescriere('');
      incarcaTot() // Reîmprospătăm lista
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <Link href="/" className="text-blue-500 text-sm hover:underline">← Înapoi la Dashboard</Link>
        
        <h1 className="text-4xl font-bold text-blue-400 mt-4 uppercase tracking-tighter">{numeVacanta}</h1>
        <p className="text-slate-600 text-[10px] font-mono mb-10">UID: {params.id}</p>

        {/* Formular Activitate */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-10 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-slate-300">➕ Adaugă în Itinerar</h2>
          <form onSubmit={adaugaActivitate} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input 
                type="text" placeholder="Ora (ex: 12:00)" value={nouaOra}
                onChange={(e) => setNouaOra(e.target.value)}
                className="w-1/3 p-3 rounded bg-slate-800 border border-slate-700 outline-none focus:border-blue-500"
              />
              <input 
                type="text" placeholder="Ce facem?" value={nouaDescriere}
                onChange={(e) => setNouaDescriere(e.target.value)}
                className="w-2/3 p-3 rounded bg-slate-800 border border-slate-700 outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="bg-blue-600 p-3 rounded font-bold hover:bg-blue-500 transition-all">
              Adaugă activitatea
            </button>
          </form>
        </section>

        {/* Lista de activități */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-400 border-b border-slate-800 pb-2">📅 Planul de călătorie</h2>
          {activitati.length === 0 && <p className="text-slate-600 italic">Nu există activități planificate.</p>}
          
          {activitati.map((a) => (
            <div key={a.id} className="flex gap-4 p-4 bg-slate-900 border-l-4 border-blue-500 rounded-r-lg shadow-md border-y border-r border-slate-800">
              <span className="font-bold text-blue-400 min-w-[60px]">{a.ora}</span>
              <span className="text-slate-200">{a.descriere}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}