import { useState } from 'react'
import { CheckCircle2, Clipboard, ClipboardPaste, Sparkles } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import '../styles/ai-workout-import.css'
import { importLiftyText } from '../lib'

const AI_PROMPT=`Você será meu especialista em treinamento físico e também responsável por gerar treinos compatíveis com o aplicativo LIFTY.

OBJETIVO
1. Entender o treino que eu quero.
2. Orientar a definição e montagem do treino quando faltarem informações importantes.
3. Propor um programa tecnicamente coerente.
4. Organizar o treino segundo a estrutura híbrida do LIFTY.
5. Apresentar o treino de forma clara para minha avaliação.
6. Fazer os ajustes que eu solicitar.
7. Somente depois da minha aprovação, gerar o TEXTO LIFTY para importação.

O LIFTY utiliza treinos híbridos. Um treino pode conter vários subblocos dos modelos resistance, cardio e interval.

REGRAS IMPORTANTES
- Não inclua carga planejada. As cargas são registradas somente durante a execução no LIFTY.
- Para resistance, use séries e repetições planejadas.
- Para cardio, use tempo e/ou distância.
- Para interval, podem ser usados tabata, emom, amrap ou custom, com rodadas, descanso entre rodadas, duração total quando aplicável, tempo de trabalho, descanso e repetições alvo.
- No último exercício de um ciclo intervalado, use REST_SECONDS: 0 quando o descanso entre ciclos for aplicado diretamente após ele.
- Prefira nomes completos e convencionais de exercícios.
- Primeiro apresente a proposta para aprovação. Não gere o formato de importação antes que eu aprove.

FORMATO FINAL OBRIGATÓRIO
Depois da minha aprovação, gere SOMENTE o texto entre os marcadores abaixo, sem Markdown, sem comentários e sem explicações antes ou depois.

=== LIFTY WORKOUT ===
VERSION: 1
NAME: Nome do treino
DESCRIPTION: descrição opcional

[BLOCK]
NAME: Nome do subbloco
MODEL: resistance

[EXERCISE]
NAME: Nome completo do exercício
KIND: resistance
SETS: 3
REPS_MIN: 10
REPS_MAX: 12

[BLOCK]
NAME: Cardio
MODEL: cardio

[EXERCISE]
NAME: Caminhada na esteira
KIND: cardio_time
TARGET_MINUTES: 10
TARGET_DISTANCE_KM: 0

[BLOCK]
NAME: HIIT
MODEL: interval
INTERVAL_MODE: custom
ROUNDS: 4
ROUND_REST_SECONDS: 60
COUNTDOWN_SECONDS: 3

[EXERCISE]
NAME: Polichinelo
KIND: bodyweight
WORK_SECONDS: 30
REST_SECONDS: 15
TARGET_REPS: 0

[EXERCISE]
NAME: Agachamento com peso corporal
KIND: bodyweight
WORK_SECONDS: 30
REST_SECONDS: 0
TARGET_REPS: 0

=== END LIFTY WORKOUT ===

CAMPOS ACEITOS
MODEL: resistance | cardio | interval
KIND: resistance | bodyweight | timed | cardio_distance | cardio_time
INTERVAL_MODE: tabata | emom | amrap | custom
Campos de exercício quando aplicáveis: SETS, REPS_MIN, REPS_MAX, TARGET_SECONDS, TARGET_MINUTES, TARGET_DISTANCE_KM, WORK_SECONDS, REST_SECONDS, TARGET_REPS, NOTES.
Campos de bloco intervalado quando aplicáveis: INTERVAL_MODE, ROUNDS, ROUND_REST_SECONDS, TOTAL_MINUTES, COUNTDOWN_SECONDS.

Não invente outros nomes de propriedades. Preserve exatamente as palavras-chave do formato acima.`

async function copyText(text:string){try{await navigator.clipboard.writeText(text);return true}catch{const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();const ok=document.execCommand('copy');area.remove();return ok}}

export default function AiWorkoutImportPage(){
 const[copied,setCopied]=useState(false);const[text,setText]=useState('');const[importing,setImporting]=useState(false)
 async function copyPrompt(){const ok=await copyText(AI_PROMPT);if(ok){setCopied(true);window.setTimeout(()=>setCopied(false),2200)}else alert('Não foi possível copiar automaticamente.')}
 async function importText(){if(!text.trim())return alert('Cole o texto gerado pela IA.');setImporting(true);try{const ids=await importLiftyText(text);setText('');alert(`${ids.length} treino(s) importado(s) com sucesso.`)}catch(err){alert(err instanceof Error?err.message:'Texto inválido ou incompatível.')}finally{setImporting(false)}}
 return <div className="page ai-import-page"><PageHeader title="IA Treino Import" subtitle="Crie seu treino com IA, copie o texto e cole no LIFTY"/>
  <section className="card ai-hero"><Sparkles className="lime-icon" size={28}/><div><h2>Sem arquivos e sem integração</h2><p>Use ChatGPT, Gemini, Claude ou outra IA. O LIFTY não envia seus dados para a IA: você apenas copia o prompt, conversa com a IA e cola aqui o texto final.</p></div></section>
  <section className="card ai-step"><div className="ai-step-title"><span>1</span><div><h2>Copie o prompt</h2><p>Ele ensina à IA como montar o treino e como gerar o texto compatível com o LIFTY.</p></div></div><button className="primary full" onClick={()=>void copyPrompt()}>{copied?<CheckCircle2 size={18}/>:<Clipboard size={18}/>} {copied?'Prompt copiado':'Copiar prompt para IA'}</button><details className="prompt-preview"><summary>Ver prompt completo</summary><pre>{AI_PROMPT}</pre></details></section>
  <section className="card ai-step"><div className="ai-step-title"><span>2</span><div><h2>Monte e aprove o treino na IA</h2><p>Converse normalmente com a IA, revise a proposta e só então peça o texto LIFTY final.</p></div></div></section>
  <section className="card ai-step"><div className="ai-step-title"><span>3</span><div><h2>Cole no LIFTY</h2><p>Cole o texto final abaixo. Você também pode colar um treino recebido de outra pessoa.</p></div></div><textarea rows={14} value={text} onChange={e=>setText(e.target.value)} placeholder="=== LIFTY WORKOUT === ..."/><button className="primary full" disabled={importing} onClick={()=>void importText()}><ClipboardPaste size={18}/>{importing?'Importando...':'Importar treino'}</button></section>
 </div>
}
