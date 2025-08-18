export default function MiniSparkline({data, height=28}:{data:number[]; height?:number}) {
  const max = Math.max(...data, 10), min = Math.min(...data, 0)
  const bars = data.slice(-12)
  return (
    <div className="flex items-end gap-1" style={{height}}>
      {bars.map((v,i)=>{
        const h = ((v-min)/(max-min+0.0001))*(height-6)+6
        return <div key={i} className="w-2 flex-none rounded bg-gradient-to-t from-brand-300 to-brand-500/70" style={{height:h}}/>
      })}
    </div>
  )
}
