export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function formatarData(date: Date): string {
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export function formatarHora(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatarDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function horaParaMinutos(hora: number, minuto: number): number {
  return hora * 60 + minuto;
}

export function posicaoVertical(dateStr: string, horaInicio = 8): number {
  const date = new Date(dateStr);
  const hora = date.getHours();
  const minuto = date.getMinutes();
  const minutosDesdeInicio = (hora - horaInicio) * 60 + minuto;
  return minutosDesdeInicio;
}

export function alturaBloco(inicioStr: string, fimStr: string): number {
  const inicio = new Date(inicioStr);
  const fim = new Date(fimStr);
  return (fim.getTime() - inicio.getTime()) / 60000;
}
