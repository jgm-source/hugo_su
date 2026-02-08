import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { MetricCard } from '@/components/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, ShoppingCart, Settings, RefreshCw, Calendar, CalendarRange } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCounts {
  leads: number;
  conversions: number;
}

type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'custom';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<EventCounts>({ leads: 0, conversions: 0 });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined);
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (dateFilter) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'yesterday':
        startDate = startOfDay(subDays(now, 1));
        endDate = endOfDay(subDays(now, 1));
        break;
      case '7days':
        startDate = startOfDay(subDays(now, 7));
        break;
      case '30days':
        startDate = startOfDay(subDays(now, 30));
        break;
      case 'custom':
        if (customDateFrom && customDateTo) {
          startDate = startOfDay(customDateFrom);
          endDate = endOfDay(customDateTo);
        } else {
          startDate = startOfDay(now);
        }
        break;
      default:
        startDate = startOfDay(now);
    }

    return { startDate, endDate };
  };

  const getDateLabel = () => {
    const { startDate, endDate } = getDateRange();
    
    if (dateFilter === 'today') {
      return `Eventos de hoje, ${format(startDate, "dd 'de' MMMM", { locale: ptBR })}`;
    } else if (dateFilter === 'yesterday') {
      return `Eventos de ontem, ${format(startDate, "dd 'de' MMMM", { locale: ptBR })}`;
    } else if (dateFilter === '7days') {
      return `Últimos 7 dias (${format(startDate, 'dd/MM')} - ${format(endDate, 'dd/MM')})`;
    } else if (dateFilter === '30days') {
      return `Últimos 30 dias (${format(startDate, 'dd/MM')} - ${format(endDate, 'dd/MM')})`;
    } else if (dateFilter === 'custom' && customDateFrom && customDateTo) {
      return `${format(customDateFrom, 'dd/MM/yyyy')} - ${format(customDateTo, 'dd/MM/yyyy')}`;
    }
    return 'Selecione um período';
  };

  const fetchEventCounts = async () => {
    setIsRefreshing(true);
    try {
      const { startDate, endDate } = getDateRange();

      // Fetch leads count from "Eventos de Lead"
      const { count: leadsCount } = await supabase
        .from('Eventos de Lead')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch conversions count from "Purchase Events"
      const { count: conversionsCount } = await supabase
        .from('Purchase Events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      setCounts({
        leads: leadsCount || 0,
        conversions: conversionsCount || 0,
      });

      // Check if credentials are configured
      const { data: credentials } = await supabase
        .from('Credenciais')
        .select('*')
        .limit(1)
        .single();

      setHasCredentials(!!(credentials && credentials['ID do Pixel'] && credentials['Acess_Token']));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching event counts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEventCounts();
  }, [user, dateFilter, customDateFrom, customDateTo]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Acompanhe seus eventos de conversão da Meta
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEventCounts}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Date Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Período:</span>
              </div>
              <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="yesterday">Ontem</SelectItem>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>

              {dateFilter === 'custom' && (
                <div className="flex gap-2 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarRange className="h-4 w-4 mr-2" />
                        {customDateFrom ? format(customDateFrom, 'dd/MM/yyyy') : 'Data inicial'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={customDateFrom}
                        onSelect={setCustomDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-muted-foreground">até</span>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarRange className="h-4 w-4 mr-2" />
                        {customDateTo ? format(customDateTo, 'dd/MM/yyyy') : 'Data final'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={customDateTo}
                        onSelect={setCustomDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {getDateLabel()}
            </p>
          </CardContent>
        </Card>

        {/* Configuration Alert */}
        {!hasCredentials && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Settings className="h-5 w-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning">Configuração Necessária</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure suas credenciais da Meta para começar a receber eventos de conversão.
                  </p>
                  <Link to="/configuracao">
                    <Button variant="outline" size="sm" className="mt-3">
                      Ir para Configuração
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          <MetricCard
            title="Eventos de Lead"
            value={counts.leads}
            description={getDateLabel()}
            icon={Users}
            trend={0}
          />
          <MetricCard
            title="Purchase Events"
            value={counts.conversions}
            description={getDateLabel()}
            icon={ShoppingCart}
            trend={0}
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Todos os eventos processados (mais recentes primeiro)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentEvents dateFilter={dateFilter} customDateFrom={customDateFrom} customDateTo={customDateTo} />
          </CardContent>
        </Card>

        {/* Last Update */}
        <div className="text-center text-sm text-muted-foreground">
          Última atualização: {format(lastUpdate, "dd/MM/yyyy 'às' HH:mm:ss")}
        </div>
      </div>
    </Layout>
  );
}

type EventTypeFilter = 'all' | 'lead' | 'purchase';

function RecentEvents({ dateFilter, customDateFrom, customDateTo }: { 
  dateFilter: DateFilter;
  customDateFrom?: Date;
  customDateTo?: Date;
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('all');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRecentEvents = async () => {
      setLoading(true);

      try {
        // Buscar eventos de lead
        const { data: leadEvents } = await supabase
          .from('Eventos de Lead')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        // Buscar eventos de purchase
        const { data: purchaseEvents } = await supabase
          .from('Purchase Events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        // Combinar e ordenar todos os eventos
        let allEvents = [
          ...(leadEvents || []).map(e => ({ ...e, type: 'lead' })),
          ...(purchaseEvents || []).map(e => ({ ...e, type: 'purchase' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Aplicar filtro de tipo
        if (eventTypeFilter !== 'all') {
          allEvents = allEvents.filter(e => e.type === eventTypeFilter);
        }

        setTotalCount(allEvents.length);

        // Paginar
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage;
        setEvents(allEvents.slice(from, to));
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEvents();
  }, [currentPage, eventTypeFilter]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum evento registrado ainda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtro de Tipo de Evento */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Tipo de Evento:</span>
        <Select value={eventTypeFilter} onValueChange={(value: EventTypeFilter) => {
          setEventTypeFilter(value);
          setCurrentPage(1); // Reset para primeira página ao mudar filtro
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="lead">Lead Events</SelectItem>
            <SelectItem value="purchase">Purchase Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <div
            key={`${event.type}-${event.id}-${index}`}
            className="flex flex-col gap-2 p-4 rounded-lg bg-muted/50 border border-border/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${event.type === 'lead' ? 'bg-blue-500' : 'bg-green-500'}`} />
                <span className="font-medium">
                  {event.type === 'lead' ? 'Lead Event' : 'Purchase Event'}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(event.created_at), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {event.type === 'lead' ? (
                <>
                  <div>
                    <span className="text-muted-foreground">Telefone: </span>
                    <span>{event.Numero || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pixel ID: </span>
                    <span>{event['Pixel ID'] || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">CTWaclid: </span>
                    <span className="font-mono text-xs">{event.CTWaclid || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-muted-foreground">Cliente: </span>
                    <span>{event.Cliente_Name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pixel ID: </span>
                    <span>{event['ID do pixel'] || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">FB Trace: </span>
                    <span className="font-mono text-xs">{event.fbtrace || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalCount)} de {totalCount} eventos
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              Primeira
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Última
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
