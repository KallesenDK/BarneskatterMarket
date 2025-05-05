"use client";
export const dynamic = "force-dynamic";
export default function AdminDashboard() {
  return <div>hello</div>;
}

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.dato}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  type StatType = { title: string; value: string; icon: any };
type OrderType = { kunde: string; beløb: string; status: string; dato: string };

const [stats, setStats] = useState<StatType[]>([
  { title: 'Total Brugere', value: '-', icon: Users },
  { title: 'Aktive Pakker', value: '-', icon: Package },
  { title: 'Nye Beskeder', value: '-', icon: MessageSquare },
  { title: 'Ordrer i Dag', value: '-', icon: ShoppingCart }
]);
const [recentOrders, setRecentOrders] = useState<OrderType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/signin';
        return;
      }
      // Hent statistik
      const [{ count: userCount }, { count: packageCount }, { count: messageCount }, { count: ordersTodayCount }, { data: orders }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscription_packages').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().slice(0, 10)),
        supabase.from('orders').select('id, customer_name, total_amount, status, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      setStats([
        { title: 'Total Brugere', value: String(userCount ?? 0), icon: Users },
        { title: 'Aktive Pakker', value: String(packageCount ?? 0), icon: Package },
        { title: 'Nye Beskeder', value: String(messageCount ?? 0), icon: MessageSquare },
        { title: 'Ordrer i Dag', value: String(ordersTodayCount ?? 0), icon: ShoppingCart }
      ]);

      setRecentOrders(
        (orders || []).map((order: any) => ({
          kunde: order.customer_name || 'Ukendt',
          beløb: order.total_amount ? `kr ${order.total_amount}` : '-',
          status: order.status === 'paid' ? 'Betalt' : 'Afventer',
          dato: order.created_at ? new Date(order.created_at).toLocaleString('da-DK') : '-'
        })) as OrderType[]
      );
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [supabase]);
