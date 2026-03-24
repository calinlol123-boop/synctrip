'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { genereazaPlanAI } from '@/app/actions'
import PackingList from '../../../components/PackingList' // Cale directă, fără @
import Link from 'next/link'

export default function PaginaVacanta() {
  const params = useParams()
  const [nume, setNume] = useState('Se încarcă...')
  const [activitati, setActivitati] = useState<any[]>([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [nouaOra, setNouaOra] = useState('')
  const [nouaDescriere, setNouaDescriere] = useState('')

  async function incarca() {
    const { data: v } = await supabase.from('vacante').select('nume').eq('id', params.id).single()
    if (v) setNume(v.nume)
    const { data: act } = await supabase.from('activitati').select('*').eq('trip_id', params.id).order('ora', { ascending: true })
    if (act) setActivitati(act)
  }

  useEffect(() => { incarca() }, [params.id])

  async function adaugaManual(e: React.FormEvent) {
    e.preventDefault()
    if (!nouaOra || !nouaDescriere) return
    await supabase.from('activitati').insert([{ trip_id: params.id, ora: nouaOra, descriere: nouaDescriere }])
    setNouaOra(''); setNouaDescriere(''); incarca()
  }

  async function handleAI() {
    setLoadingAI(true)
    const sugestii = await genereazaPlanAI(nume)
    if (sugestii) {
      for (const s of sugestii) {
        await supabase.from('activitati').insert([{ trip_id: params.id, ora: s.ora, descriere: s.descriere }])
      }
      incarca()
    }
    setLoadingAI(false)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-slate-500 hover:text-white text-sm">← DASHBOARD</Link>
        <h1 className="text-6xl font-black text-blue-500 mt-4 uppercase tracking-tighter">{nume}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
          <section>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-slate-300">📅 ITINERAR</h2>
               <button onClick={handleAI} disabled={loadingAI} className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-xs">
                 {loadingAI ? "GÂNDESC..." : "✨ PLAN AI"}
               </button>
            </div>
            
            <form onSubmit={adaugaManual} className="mb-6 flex gap-2">
              <input placeholder="Ora" value={nouaOra} onChange={(e) => setNouaOra(e.target.value)} className="w-20 bg-slate-900 border border-slate-800 p-2 rounded-lg text-sm" />
              <input placeholder="Activitate..." value={nouaDescriere} onChange={(e) => setNouaDescriere(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 p-2 rounded-lg text-sm" />
              <button type="submit" className="bg-slate-800 px-4 rounded-lg font-bold">+</button>
            </form>

            <div className="space-y-4">
              {activitati.map((a) => (
                <div key={a.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-blue-400 font-bold text-sm">{a.ora}</span>
                  <p className="text-slate-200">{a.descriere}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
             <PackingList tripId={params.id as string} tripName={nume} />
          </section>
        </div>
      </div>
    </main>
  )
}