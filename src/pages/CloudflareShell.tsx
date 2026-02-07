import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cloudflareService } from '@/lib/cloudflare';
import { motion } from 'framer-motion';
import { Terminal, CornerDownLeft, Trash2, Info } from 'lucide-react';
type ShellLine = {
  id: string;
  kind: 'prompt' | 'stdout' | 'stderr' | 'hint';
  text: string;
};
function promptText(): string {
  return 'nebula@edge:~$';
}
function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
export function CloudflareShell() {
  const [lines, setLines] = useState<ShellLine[]>([
    {
      id: crypto.randomUUID(),
      kind: 'hint',
      text: 'Nebula Cloudflare Shell — high-fidelity Wrangler simulation. Try: wrangler whoami, wrangler login, wrangler d1 list, wrangler pages dev',
    },
  ]);
  const [value, setValue] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const helpShortcuts = useMemo(() => {
    const key = isMac() ? '⌘K' : 'Ctrl+K';
    return `${key} clear • ↑/↓ history • Enter run`;
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lines]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const appendLine = useCallback((line: Omit<ShellLine, 'id'>) => {
    setLines((prev) => [...prev, { id: crypto.randomUUID(), ...line }]);
  }, []);
  const typeOut = useCallback(async (kind: ShellLine['kind'], text: string) => {
    // Typing animation: progressively reveals the output on a single line.
    const id = crypto.randomUUID();
    setLines((prev) => [...prev, { id, kind, text: '' }]);
    let acc = '';
    const stepMs = 6; // fast "terminal" typing
    for (let i = 0; i < text.length; i++) {
      acc += text[i];
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => window.setTimeout(r, stepMs));
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, text: acc } : l)));
    }
  }, []);
  const runCommand = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || isBusy) return;
    setIsBusy(true);
    setValue('');
    historyRef.current = [trimmed, ...historyRef.current].slice(0, 50);
    historyIndexRef.current = -1;
    appendLine({ kind: 'prompt', text: `${promptText()} ${trimmed}` });
    try {
      const result = await cloudflareService.executeShellCommand(trimmed);
      if (result.stdout?.trim()) {
        await typeOut('stdout', result.stdout.trimEnd());
      }
      if (result.stderr?.trim()) {
        await typeOut('stderr', result.stderr.trimEnd());
      }
      if ((result.stdout?.trim() || result.stderr?.trim()) === '') {
        appendLine({ kind: 'stdout', text: '' });
      }
      if (result.exitCode !== 0) {
        appendLine({
          kind: 'hint',
          text: `exit ${result.exitCode}`,
        });
      }
    } catch (e) {
      console.error('[CloudflareShell] command execution error:', e);
      appendLine({
        kind: 'stderr',
        text: 'Unexpected shell error. Please try again.',
      });
    } finally {
      setIsBusy(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [appendLine, isBusy, typeOut, value]);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void runCommand();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nextIndex = Math.min(historyIndexRef.current + 1, historyRef.current.length - 1);
        historyIndexRef.current = nextIndex;
        const next = historyRef.current[nextIndex] ?? '';
        setValue(next);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = Math.max(historyIndexRef.current - 1, -1);
        historyIndexRef.current = nextIndex;
        const next = nextIndex === -1 ? '' : historyRef.current[nextIndex] ?? '';
        setValue(next);
        return;
      }
      // Clear line: Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setLines([
          {
            id: crypto.randomUUID(),
            kind: 'hint',
            text: 'Cleared. Type a wrangler command to continue.',
          },
        ]);
      }
    },
    [runCommand]
  );
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Terminal className="h-6 w-6 text-primary" />
              Cloudflare Shell
            </h1>
            <p className="text-slate-400">
              Run simulated Wrangler commands for operational workflows—optimized for a “Deep Space” admin experience.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-white/10 text-slate-400 bg-white/5">
              {helpShortcuts}
            </Badge>
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5"
              onClick={() => {
                setLines([
                  {
                    id: crypto.randomUUID(),
                    kind: 'hint',
                    text: 'Cleared. Type a wrangler command to continue.',
                  },
                ]);
                setValue('');
                historyRef.current = [];
                historyIndexRef.current = -1;
                window.setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
        <Card className="glass-panel border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-black/20">
            <CardTitle className="text-white flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                <CornerDownLeft className="h-4 w-4 text-primary" />
              </span>
              Terminal Emulator
              {isBusy && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-auto text-xs text-slate-400"
                >
                  executing…
                </motion.span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              {/* Scanline / CRT overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-screen">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.10),rgba(255,255,255,0.10)_1px,transparent_1px,transparent_4px)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(243,128,32,0.22),transparent_55%)]" />
              </div>
              <div className="h-[520px] bg-[#070A12] font-mono text-sm text-slate-200 px-4 py-4 overflow-y-auto">
                <div className="nebula-grid rounded-xl p-4 border border-white/5 bg-black/20">
                  <div className="space-y-2">
                    {lines.map((l) => (
                      <motion.div
                        key={l.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={
                          l.kind === 'prompt'
                            ? 'text-slate-200'
                            : l.kind === 'stderr'
                              ? 'text-red-300'
                              : l.kind === 'hint'
                                ? 'text-slate-400'
                                : 'text-emerald-200'
                        }
                      >
                        <span className="whitespace-pre-wrap leading-relaxed">{l.text}</span>
                      </motion.div>
                    ))}
                    <div ref={scrollRef} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="shrink-0 text-slate-400">{promptText()}</div>
                  <Input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={isBusy}
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="bg-white/5 border-white/10 text-slate-100 font-mono placeholder:text-slate-600 focus:ring-primary focus:border-primary"
                    placeholder="wrangler whoami"
                    aria-label="Terminal command input"
                  />
                  <Button className="btn-gradient shrink-0" onClick={() => void runCommand()} disabled={isBusy}>
                    Run
                  </Button>
                </div>
                <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    This is a simulation for UX and workflow design. Hook it up to real Cloudflare APIs/tools later (with server-side auth).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-panel border-white/5 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Suggested commands</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <code className="text-xs text-emerald-200">wrangler whoami</code>
                <Button variant="outline" className="border-white/10 h-8" onClick={() => setValue('wrangler whoami')}>
                  Paste
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <code className="text-xs text-emerald-200">wrangler login</code>
                <Button variant="outline" className="border-white/10 h-8" onClick={() => setValue('wrangler login')}>
                  Paste
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <code className="text-xs text-emerald-200">wrangler d1 list</code>
                <Button variant="outline" className="border-white/10 h-8" onClick={() => setValue('wrangler d1 list')}>
                  Paste
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <code className="text-xs text-emerald-200">wrangler pages dev</code>
                <Button variant="outline" className="border-white/10 h-8" onClick={() => setValue('wrangler pages dev')}>
                  Paste
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/5 px-3 py-2">
                <span className="text-slate-400">Transport</span>
                <span className="text-white font-mono">simulated</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/5 px-3 py-2">
                <span className="text-slate-400">Latency</span>
                <span className="text-white font-mono">~12ms</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/5 px-3 py-2">
                <span className="text-slate-400">Edge runtime</span>
                <span className="text-white font-mono">ready</span>
              </div>
              <div className="text-xs text-slate-500">
                Tip: integrate this with Durable Objects for shared state + audit log when switching to real ops.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}