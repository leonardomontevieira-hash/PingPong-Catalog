/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Activity, LayoutGrid, ChevronRight, Info, X, Target, MessageSquare, Send, Bot, ChevronLeft, BookOpen } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Stats {
  ataque: number;
  defesa: number;
  saque: number;
  efeito: number;
  visao: number;
}

type Rank = 'D' | 'C' | 'B' | 'A' | 'S';

interface Player {
  id: string;
  name: string;
  stats: Stats;
  description: string;
  style: string;
  weaknesses?: string[];
  specialty?: string;
  skills?: string[];
}

interface Skill {
  name: string;
  description: string;
  rank?: Rank;
}

const SKILLS: Skill[] = [
  {
    name: 'Mestre do efeito',
    description: 'uma habilidade que consiste num conhecimento avançado do efeito e de suas propriedades',
    rank: 'S'
  },
  {
    name: 'Tela preta',
    description: 'Uma habilidade quase que selvagem, o jogador não pensa, ele ta imerso no jogo, sem raciocínio, jogando sem pensar em nada, apenas estinto',
    rank: 'S'
  },
  {
    name: 'Aprendizado rápido',
    description: 'a habilidade que torna os jogadores como máquinas de aprendizado, podendo aprender algo novo em instantes, analise rápida e leitura de jogo, podendo sempre avançar e se auto-refinar.',
    rank: 'S'
  },
  {
    name: 'reação espelho',
    description: 'uma habilidade cujo jogador sabe onde a bola ira pingar e posiciona a raquete de forma estratégica para que a bolinha volte na mesma hora em que pinga na mesa.',
    rank: 'A'
  },
  {
    name: 'adaptação lógica',
    description: 'uma habilida que faz com que os usuarios aprendam a se adaptar a novas jogadas ou a novos jogadores inimigos',
    rank: 'A'
  },
  {
    name: 'sede de sangue',
    description: 'uma habilidade que faz com que o jogador sempre encontre o ponto certo para matar, sempre encontrando uma brecha independentemente do lado em que a bolinha está na mesa.',
    rank: 'A'
  },
  {
    name: 'fake saque',
    description: 'ela consiste em olhar para um lado da mesa do seu oponente e sacar para o lado oposto com velocidade, dando menos tempo de reação ao oponente',
    rank: 'B'
  }
];

const getRank = (score: number): Rank => {
  if (score >= 8.5) return 'S';
  if (score >= 7.5) return 'A';
  if (score >= 6.5) return 'B';
  if (score >= 5.0) return 'C';
  return 'D';
};

const getRankColor = (rank: Rank) => {
  return 'text-orange-500';
};

interface Topic {
  id: string;
  title: string;
  players: Player[];
}

const TOPICS: Topic[] = [
  {
    id: '6',
    title: '6ºano',
    players: [
      {
        id: '6-fabricio',
        name: 'Fabricio',
        stats: { ataque: 7, defesa: 6, saque: 5, efeito: 3, visao: 8 },
        description: 'Potencial bom, fome por poder e muita ambição, entretanto ele subestima os demais facilmente.',
        style: 'clássico',
      }
    ]
  },
  {
    id: '7',
    title: '7ºano',
    players: []
  },
  {
    id: '8',
    title: '8ºano',
    players: [
      { 
        id: '8-kevin', 
        name: 'Kevin', 
        stats: { ataque: 8, defesa: 5, saque: 6, efeito: 4, visao: 8 },
        description: 'um jogador feito para matar, não conseguindo se segurar durante as partidas, isso acaba prejudicando sua defesa.',
        style: '1 dedo',
        weaknesses: ['Defesa vulnerável por agressividade excessiva', 'Falta de autocontrole ofensivo'],
        skills: ['sede de sangue']
      },
    ]
  },
  {
    id: '9',
    title: '9ºano',
    players: [
      { 
        id: '9-dutra', 
        name: 'Dutra', 
        stats: { ataque: 7, defesa: 9, saque: 7, efeito: 6, visao: 8 },
        description: 'Um jogador com talento nato, aprende rápido e decora padrões de médio porte, a melhor estratégia é um ataque sem trégua, por mais que sua defesa seja alta, o escudo sempre quebra.',
        style: 'clássico',
        weaknesses: ['Ataque sem trégua (escudo quebra)', 'Pressão constante'],
        skills: ['Aprendizado rápido', 'adaptação lógica']
      },
      { 
        id: '9-ph', 
        name: 'PH', 
        stats: { ataque: 5, defesa: 5, saque: 4, efeito: 5, visao: 4 },
        description: 'um jogador abaixo da media, não apresenta grandes evoluções com o decorrer do tempo, sabe o básico e entende as regras, mas não parece entender o verdadeiro motivo para não evoluir.',
        style: '4 Dedos',
        weaknesses: ['Falta de evolução', 'Dificuldade técnica básica']
      },
      { 
        id: '9-miguel', 
        name: 'Miguel', 
        stats: { ataque: 6, defesa: 6, saque: 6, efeito: 7, visao: 7 },
        description: 'um jogador com potencial para uma grande visão de jogo, futuramente podendo prever movimentos, ainda falta controle para saber a hora certa de atacar, com mais pratica pode se tornar muito mais do que um jogador médio.',
        style: 'clássico',
        weaknesses: ['Falta de controle no ataque', 'Timing ofensivo']
      },
      { 
        id: '9-breno', 
        name: 'Breno', 
        stats: { ataque: 7, defesa: 7, saque: 7, efeito: 6, visao: 6 },
        description: 'Talentoso, aprende rápido e analiza outros jogos para adaptar técnicas para suas partidas, um jogados equilibrado em constante evolução, uma das suas fraquezas é jogadas excessivas ao lado esquerdo dele, uma hora a defesa dele quebra.',
        style: '4 Dedos',
        weaknesses: ['Lado esquerdo vulnerável']
      },
      { 
        id: '9-romagnoli', 
        name: 'Romagnoli', 
        stats: { ataque: 7, defesa: 8, saque: 8, efeito: 9, visao: 9 },
        description: 'um gênio do efeito, estilo clássico elegante, um lobo em pele de cordeiro, sempre com ataques prontos escondidos numa camada de calma e seriedade, entretando é instável apesar de estatisticamente ótimo.',
        style: 'clássico',
        weaknesses: ['Instabilidade emocional/técnica'],
        specialty: 'Efeito',
        skills: ['Mestre do efeito', 'adaptação lógica', 'sede de sangue']
      },
      { 
        id: '9-matheus', 
        name: 'Matheus', 
        stats: { ataque: 8, defesa: 6, saque: 7, efeito: 4, visao: 6 },
        description: 'um estilo de caneta interessante, bonito de se assistir, ele é como um minério raro não esculpido, tem potencial mas não investe, além do mais não aguenta ataques rápidos.',
        style: 'caneta',
        weaknesses: ['Ataques rápidos', 'Falta de investimento/treino'],
        skills: ['sede de sangue']
      },
      { 
        id: '9-nicollas', 
        name: 'Nicollas', 
        stats: { ataque: 9, defesa: 8, saque: 7, efeito: 8, visao: 10 },
        description: 'o atual ápice do ping pong, ser canhoto trás uma vantagem absurda durante as partidas, pensamento rápido e confiança.',
        style: '4 Dedos',
        weaknesses: ['Excesso de confiança (ocasional)', 'Raiva excessiva em pontos por sorte do oponente'],
        skills: ['Aprendizado rápido', 'reação espelho', 'fake saque', 'adaptação lógica']
      },
      { 
        id: '9-leonardo', 
        name: 'Leonardo', 
        stats: { ataque: 7, defesa: 7, saque: 7, efeito: 7, visao: 8 },
        description: 'jogador adpatél, se torna melhor quanto mais joga contra outra pessoa, não possui pensamentos lógicos durante as partidas, jogando quase por puro estinto, sua fraqueza é falar enquanto joga e ataques no lado esquerdo superior.',
        style: '4 Dedos',
        weaknesses: ['Falar enquanto joga', 'Lado esquerdo superior'],
        skills: ['Tela preta', 'fake saque', 'adaptação lógica']
      },
      { 
        id: '9-yan', 
        name: 'Yan', 
        stats: { ataque: 6, defesa: 7, saque: 6, efeito: 7, visao: 7 },
        description: 'Jogador malicioso, sempre apto pra cortar ou finalizar, com cartas na manga a maioria do tempo',
        style: '4 Dedos',
        skills: ['fake saque']
      },
      { 
        id: '9-catota', 
        name: 'Catota', 
        stats: { ataque: 5, defesa: 7, saque: 4, efeito: 1, visao: 3 },
        description: 'jogador mediano/abaido da média, tem um estilo de jogo parado e nada flexivel, sua defesa é facilmente quebradas com ataques de alta velocidade.',
        style: 'Horizontal',
        weaknesses: ['Estilo de jogo parado', 'Nada flexível', 'Defesa vulnerável a alta velocidade']
      },
      { 
        id: '9-enzio', 
        name: 'Enzio', 
        stats: { ataque: 4, defesa: 5, saque: 2, efeito: 0, visao: 3 },
        description: 'Jogador semi aposentado, não tem nenhuma qualidade muito grande e precisa aprender efeito.',
        style: 'clássico',
        weaknesses: ['Falta de efeito', 'Falta de qualidades técnicas marcantes']
      },
    ]
  },
  {
    id: 'Extra',
    title: 'Extra',
    players: [
      { 
        id: 'extra-arakem', 
        name: 'Arakem', 
        stats: { ataque: 7, defesa: 8, saque: 8, efeito: 7, visao: 8 },
        description: 'rápido, inteligente, boa defesa mas possui a fatidica defesa no lado esquerdo, sem contar a quantidade de tentativas de ataques falhos.',
        style: 'caneta',
        weaknesses: ['Lado esquerdo vulnerável', 'Tentativas de ataques falhos']
      },
    ]
  },
];

const getAverage = (stats: Stats) => {
  return (stats.ataque + stats.defesa + stats.saque + stats.efeito + stats.visao) / 5;
};

const RadarChart = ({ stats, color }: { stats: Stats; color: string }) => {
  const size = 180;
  const center = size / 2;
  const radius = size * 0.35;
  const categories: (keyof Stats)[] = ['ataque', 'defesa', 'saque', 'efeito', 'visao'];
  const labels = ['Ataque', 'Defesa', 'Saque', 'Efeito', 'Visão'];
  
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const r = (value / 10) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = categories.map((cat, i) => getPoint(i, stats[cat]));
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const gridLevels = [2, 4, 6, 8, 10];

  return (
    <div className="relative w-full flex justify-center items-center py-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {gridLevels.map((level) => {
          const gridPoints = categories.map((_, i) => {
            const p = getPoint(i, level);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <polygon
              key={level}
              points={gridPoints}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          );
        })}
        
        {categories.map((_, i) => {
          const p = getPoint(i, 10);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          );
        })}

        <motion.polygon
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          points={polygonPoints}
          fill={`${color}22`}
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {labels.map((label, i) => {
          const p = getPoint(i, 12);
          return (
            <text
              key={label}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              className="text-[9px] uppercase font-bold fill-slate-500"
              dominantBaseline="middle"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const PingPongMaru = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Olá! Eu sou o PingPong-Maru, a IA oficial do PingPong Catalog. Como posso ajudar você hoje com informações sobre nossos jogadores e habilidades?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      
      const context = `
        Você é o PingPong-Maru, um assistente especializado no PingPong Catalog.
        Aqui estão os dados dos jogadores e habilidades disponíveis:

        JOGADORES:
        ${TOPICS.map(t => t.players.map(p => `- ${p.name} (${t.title}): ${p.description}. Status: Ataque ${p.stats.ataque}, Defesa ${p.stats.defesa}, Saque ${p.stats.saque}, Efeito ${p.stats.efeito}, Visão ${p.stats.visao}. Estilo: ${p.style}. Habilidades: ${p.skills?.join(', ') || 'Nenhuma'}.`).join('\n')).join('\n')}

        HABILIDADES:
        ${SKILLS.map(s => `- ${s.name} (Rank ${s.rank}): ${s.description}`).join('\n')}

        Responda de forma prestativa, técnica e amigável. Se não souber algo, admita.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: context }] },
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ]
      });

      const text = response.text || "Desculpe, tive um problema ao processar sua resposta.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Ocorreu um erro na conexão com meus sistemas. Por favor, tente novamente mais tarde." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-[calc(100vh-80px)] flex flex-col bg-[#121214] border-white/10 overflow-hidden shadow-2xl"
    >
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Bot className="w-6 h-6 text-black" />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight uppercase">PingPong-Maru</h3>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Sistemas Operacionais</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
              m.role === 'user' 
                ? "bg-orange-500 text-black font-medium rounded-tr-none" 
                : "bg-white/5 border border-white/5 text-slate-300 rounded-tl-none"
            )}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre jogadores, habilidades ou rankings..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-600"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 w-12 bg-orange-500 rounded-xl flex items-center justify-center text-black hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'jogadores' | 'habilidades' | 'analise' | 'maru'>('jogadores');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [analysisPlayer, setAnalysisPlayer] = useState<Player | null>(null);
  const [skillPageIndex, setSkillPageIndex] = useState(0);
  
  const activeTopic = activeTopicId ? TOPICS.find(t => t.id === activeTopicId) : null;

  return (
    <div className="min-h-screen bg-[#080809] text-slate-200 font-sans selection:bg-orange-500 selection:text-white">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-orange-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>

      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-lg font-black tracking-tighter uppercase">
              PingPong <span className="text-slate-500">Catalog</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span 
              onClick={() => setActiveTab('jogadores')}
              className={`cursor-pointer transition-colors ${activeTab === 'jogadores' ? 'text-orange-500' : 'hover:text-white'}`}
            >
              Jogadores
            </span>
            <span 
              onClick={() => setActiveTab('habilidades')}
              className={`cursor-pointer transition-colors ${activeTab === 'habilidades' ? 'text-orange-500' : 'hover:text-white'}`}
            >
              Habilidades
            </span>
            <span 
              onClick={() => setActiveTab('analise')}
              className={`cursor-pointer transition-colors ${activeTab === 'analise' ? 'text-orange-500' : 'hover:text-white'}`}
            >
              Análise
            </span>
            <span 
              onClick={() => setActiveTab('maru')}
              className={`cursor-pointer transition-colors ${activeTab === 'maru' ? 'text-orange-500' : 'hover:text-white'}`}
            >
              PingPong-Maru
            </span>
          </div>
        </div>
      </header>

      <main className={cn(
        "relative z-10 mx-auto transition-all duration-500",
        activeTab === 'maru' ? "max-w-none px-0 py-0" : "max-w-7xl px-6 py-12"
      )}>
        {activeTab === 'jogadores' ? (
          <>
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <LayoutGrid className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">Avaliação Técnica</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-4">
                Desempenho <br />
                <span className="text-slate-700">dos Jogadores.</span>
              </h2>
            </div>

            {/* Topic Selector */}
            <div className="flex flex-wrap gap-3 mb-12">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`px-8 py-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                    activeTopicId === topic.id
                      ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20'
                      : 'bg-[#121214] border-white/5 text-slate-500 hover:border-white/10'
                  }`}
                >
                  <span className="text-2xl font-black">{topic.id}</span>
                  {topic.id !== topic.title && (
                    <span className="text-[10px] font-bold uppercase tracking-widest">{topic.title}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Players Grid */}
            <AnimatePresence mode="wait">
              {activeTopic ? (
                <motion.div
                  key={activeTopicId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {activeTopic.players.length > 0 ? (
                    [...activeTopic.players]
                      .sort((a, b) => getAverage(a.stats) - getAverage(b.stats))
                      .map((player) => (
                      <motion.div 
                        key={player.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedPlayer(player)}
                        className="bg-[#121214] border border-white/5 rounded-2xl p-8 hover:border-orange-500/30 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                              <User className="w-6 h-6 text-slate-400 group-hover:text-black transition-colors" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold tracking-tight">{player.name}</h3>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">ID: {player.id}</p>
                                <span className="text-[8px] px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded border border-orange-500/20 font-black uppercase tracking-tighter">
                                  {player.style}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400">
                            {activeTopic.id === 'Extra' ? activeTopic.id : `${activeTopic.id}ºano`}
                          </div>
                        </div>

                        <div className="mb-8">
                          <RadarChart stats={player.stats} color="#F97316" />
                        </div>

                        <div className="space-y-3">
                          {Object.entries(player.stats).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {key === 'visao' ? 'Visão de Jogo' : key.charAt(0).toUpperCase() + key.slice(1)}
                              </span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${val * 10}%` }}
                                    className="h-full bg-orange-500"
                                  />
                                </div>
                                <span className="text-xs font-mono font-bold w-8 text-right">{val}/10</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 flex items-center justify-between gap-2">
                          <div className={`text-3xl font-black italic ${getRankColor(getRank(getAverage(player.stats)))}`}>
                            {getRank(getAverage(player.stats))}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            Clique para ver descrição <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum jogador cadastrado neste ano</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center border border-dashed border-white/10 rounded-3xl"
                >
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Selecione um ano para visualizar os jogadores</p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : activeTab === 'habilidades' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-12 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">Grimório Técnico</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-4">
                Livro de <br />
                <span className="text-slate-700">Habilidades.</span>
              </h2>
            </div>

            <div className="relative aspect-[1.4/1] bg-[#121214] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex">
              {/* Book Spine */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 z-10 shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
              
              {/* Left Page (Index/Decoration) */}
              <div className="flex-1 p-8 border-r border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                <div className="h-full flex flex-col">
                  <div className="mb-8">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Sumário de Técnicas</h4>
                    <div className="space-y-2">
                      {SKILLS.map((s, i) => (
                        <button
                          key={s.name}
                          onClick={() => setSkillPageIndex(i)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            skillPageIndex === i ? "bg-orange-500 text-black" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                          )}
                        >
                          {String(i + 1).padStart(2, '0')}. {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto opacity-20">
                    <Activity className="w-24 h-24 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Right Page (Content) */}
              <div className="flex-1 p-12 relative bg-gradient-to-bl from-white/[0.02] to-transparent">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={skillPageIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                        <Target className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="text-5xl font-black italic text-orange-500/20 leading-none">
                        {SKILLS[skillPageIndex].rank}
                      </div>
                    </div>

                    <h3 className="text-3xl font-black tracking-tight uppercase mb-6 text-orange-500">
                      {SKILLS[skillPageIndex].name}
                    </h3>
                    
                    <p className="text-slate-300 leading-relaxed italic text-lg mb-8">
                      "{SKILLS[skillPageIndex].description}"
                    </p>

                    <div className="mt-auto flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span>Página {skillPageIndex + 1}</span>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setSkillPageIndex(prev => Math.max(0, prev - 1))}
                          disabled={skillPageIndex === 0}
                          className="hover:text-orange-500 disabled:opacity-20 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSkillPageIndex(prev => Math.min(SKILLS.length - 1, prev + 1))}
                          disabled={skillPageIndex === SKILLS.length - 1}
                          className="hover:text-orange-500 disabled:opacity-20 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'maru' ? (
          <PingPongMaru />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">Análise de Desempenho</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-4">
                Ranking <br />
                <span className="text-slate-700">Geral.</span>
              </h2>
            </div>

            <div className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Jogador</div>
                <div className="col-span-2 text-center">Ano</div>
                <div className="col-span-2 text-center">Média</div>
                <div className="col-span-2 text-right">Rank</div>
              </div>
              <div className="divide-y divide-white/5">
                {TOPICS.flatMap(t => t.players.map(p => ({ ...p, topicId: t.id })))
                  .sort((a, b) => getAverage(b.stats) - getAverage(a.stats))
                  .map((player, index) => (
                    <div 
                      key={player.id}
                      onClick={() => setAnalysisPlayer(player)}
                      className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className="col-span-1 font-mono text-slate-500">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="col-span-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                          <User className="w-5 h-5 text-slate-500 group-hover:text-black transition-colors" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-orange-500 transition-colors">{player.name}</div>
                          <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{player.style}</div>
                        </div>
                      </div>
                      <div className="col-span-2 text-center text-xs font-bold text-slate-400">
                        {player.topicId === 'Extra' ? player.topicId : `${player.topicId}º`}
                      </div>
                      <div className="col-span-2 text-center font-mono font-black text-orange-500">
                        {getAverage(player.stats).toFixed(1)}
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-xl font-black italic text-orange-500">{getRank(getAverage(player.stats))}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Player Description Modal */}
        <AnimatePresence>
          {selectedPlayer && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPlayer(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <button 
                  onClick={() => setSelectedPlayer(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center">
                    <User className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight uppercase">{selectedPlayer.name}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-orange-500">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Perfil Técnico</span>
                      </div>
                      <div className={`text-xl font-black italic ${getRankColor(getRank(getAverage(selectedPlayer.stats)))}`}>
                        RANK {getRank(getAverage(selectedPlayer.stats))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Descrição do Atleta</h4>
                    <p className="text-slate-300 leading-relaxed italic">
                      "{selectedPlayer.description}"
                    </p>
                  </div>

                  {selectedPlayer.skills && selectedPlayer.skills.length > 0 && (
                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Habilidades Especiais</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlayer.skills.map(skillName => {
                          const skillInfo = SKILLS.find(s => s.name === skillName);
                          return (
                            <div key={skillName} className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center gap-2">
                              <Activity className="w-3 h-3 text-orange-500" />
                              <span className="text-[10px] font-bold uppercase text-orange-500">{skillName}</span>
                              {skillInfo?.rank && (
                                <span className="ml-1 text-[10px] font-black text-orange-500 opacity-60">[{skillInfo.rank}]</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Média Geral</div>
                      <div className="text-2xl font-black text-orange-500">
                        {((selectedPlayer.stats.ataque + selectedPlayer.stats.defesa + selectedPlayer.stats.saque + selectedPlayer.stats.efeito + selectedPlayer.stats.visao) / 5).toFixed(1)}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Estilo de Jogo</div>
                      <div className="text-xs font-bold uppercase text-orange-500">
                        {selectedPlayer.style}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Especialidade</div>
                      <div className="text-xs font-bold uppercase text-white">
                        {selectedPlayer.specialty || (() => {
                          const stats = selectedPlayer.stats;
                          const entries = Object.entries(stats) as [string, number][];
                          const best = entries.reduce((prev, curr) => curr[1] > prev[1] ? curr : prev);
                          return best[0] === 'visao' ? 'Visão de Jogo' : best[0].charAt(0).toUpperCase() + best[0].slice(1);
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedPlayer(null)}
                  className="w-full mt-8 py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-colors"
                >
                  Fechar Perfil
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {analysisPlayer && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAnalysisPlayer(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <button 
                  onClick={() => setAnalysisPlayer(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight uppercase">{analysisPlayer.name}</h3>
                    <div className="flex items-center gap-2 text-orange-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Análise de Desvantagens</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Pontos de Vulnerabilidade</h4>
                    <div className="space-y-3">
                      {analysisPlayer.weaknesses && analysisPlayer.weaknesses.length > 0 ? (
                        analysisPlayer.weaknesses.map((weakness, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                            <p className="text-sm text-slate-300 leading-relaxed">{weakness}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">Nenhuma desvantagem crítica mapeada.</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      * Esta análise é baseada em observações técnicas e padrões de jogo identificados em partidas oficiais.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setAnalysisPlayer(null)}
                  className="w-full mt-8 py-4 border border-white/10 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors"
                >
                  Voltar ao Ranking
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <div className="mt-24 p-8 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 bg-orange-500 rounded-2xl">
            <Info className="w-8 h-8 text-black" />
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2">Protocolo de Avaliação Técnica</h4>
            <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
              Nosso sistema de avaliação de jogadores utiliza uma escala de 0 a 10 em cinco disciplinas principais. 
              A visualização em pentágono fornece uma visão rápida do perfil técnico do atleta, 
              destacando pontos fortes e áreas para desenvolvimento.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-24 border-t border-white/5 py-12 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <Activity className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-widest">PingPong Database</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            © 2026 Divisão de Análise de Desempenho
          </div>
        </div>
      </footer>
    </div>
  );
}
