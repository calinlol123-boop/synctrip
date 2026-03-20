'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link' // <--- Asta e important, e "ușa" noastră

export default function Home() {
  const [numeNou, setNumeNou] = useState('')
  const [vacante, setVacante] = useState<any[]>([])

  async function incarcaVacante() {
    const { data } = await supabase.from('vacante').select('*').order('created_at', { ascending: false })
    if (data) setVacante(data)
  }

  useEffect(() => { incarcaVacante() }, [])

  async function adauga(e: React.FormEvent) {
    e.preventDefault()
    if (!numeNou) return
    const { error } = await supabase.from('vacante').insert([{ nume: numeNou }])
    if (!error) { setNumeNou(''); incarcaVacante() }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-blue-400 mb-10">SyncTrip Hub 🌍</h1>
      
      <form onSubmit={adauga} className="flex gap-2 mb-10 w-full max-w-md">
        <input 
          type="text" 
          value={numeNou}
          onChange={(e) => setNumeNou(e.target.value)}
          placeholder="Ex: Vacanță la munte"
          className="flex-1 p-3 rounded bg-slate-800 border border-slate-700 outline-none"
        />
        <button type="submit" className="bg-blue-600 px-6 py-3 rounded font-bold">Adaugă</button>
      </form>

      <div className="w-full max-w-md space-y-4">
        {vacante.map((v) => (
          <div key={v.id} className="p-4 bg-slate-800 rounded border border-slate-700 flex justify-between items-center">
            <span>{v.nume}</span>
            {/* Butonul care ne va duce la pagina vacanței */}
            <Link href={`/trip/${v.id}`} className="text-blue-400 hover:underline">
               Vezi detalii →
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}