async function handleAI() {
    setLoading(true)
    try {
      const sugestii = await genereazaBagajAI(tripName)
      
      // Ștergem obiectele vechi de siguranță (opțional, dacă vrei o listă nouă)
      // await supabase.from('bagaje').delete().eq('trip_id', tripId)

      for (const s of sugestii) {
        await supabase.from('bagaje').insert([
          { trip_id: tripId, obiect: s.obiect, categorie: s.categorie }
        ])
      }
      await incarca() // Reîmprospătăm lista pe ecran
    } catch (err) {
      alert("AI-ul de bagaje este momentan ocupat.")
    } finally {
      setLoadingAI(false)
    }
  }