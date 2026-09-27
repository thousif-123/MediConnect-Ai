import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileText,
  MapPin,
  Building,
  Phone,
  Eye,
} from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getBadge = (status: Order['status']) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 text-xs">Pharmacist Review</span>;
      case 'ACCEPTED':
      case 'READY_FOR_PICKUP':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs">{status.replace('_', ' ')}</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 text-xs">Completed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <ShoppingCart className="w-7 h-7 text-emerald-600" />
          My Medicine Orders & Reservations
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review pickup status, pharmacist verification updates, and prescription fulfillment notes.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-xs text-slate-500">You haven't placed any medicine reservations yet.</p>
          <Link
            to="/pharmacies"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
          >
            Find Pharmacies & Browse Stock
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{order.orderNumber}</span>
                    {getBadge(order.status)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Ordered: {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900">
                    ${order.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">Pay at counter upon pickup</div>
                </div>
              </div>

              {/* Pharmacy info */}
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <Building className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">{order.pharmacy?.name || 'Local Pharmacy'}</span>
                  <div>{order.pharmacy?.address}</div>
                </div>
              </div>

              {/* Items */}
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>
                      {it.quantity}x {it.medicineName} {it.requiresPrescription ? '(Prescription Item)' : ''}
                    </span>
                    <span className="font-semibold">${(it.quantity * it.unitPrice).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Pharmacist note */}
              {order.pharmacistNotes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">Pharmacist Clinical Note:</span>
                  <span>{order.pharmacistNotes}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 text-xs">
                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
                >
                  View Order Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-400">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <Link to="/orders" className="text-xs text-emerald-600 font-semibold hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Submitted on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs">
            {order.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 block">Fulfilling Pharmacy</span>
            <div className="font-semibold text-slate-900">{order.pharmacy?.name}</div>
            <div>{order.pharmacy?.address}</div>
            <div>Tel: {order.pharmacy?.phone}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 block">Pickup Readiness</span>
            <div><strong>Estimate:</strong> {order.pickupTimeEstimate || '2-4 hours'}</div>
            {order.pharmacistNotes && <div><strong>Staff Note:</strong> {order.pharmacistNotes}</div>}
          </div>
        </div>

        {order.prescription && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs flex justify-between items-center">
            <div>
              <span className="font-bold text-rose-900 block">Attached Prescription</span>
              <span className="text-rose-700">{order.prescription.originalFilename}</span>
            </div>
            <a
              href={`/api/prescriptions/${order.prescription._id}/view`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> View
            </a>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Reserved Items</h3>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
            {order.items?.map((it: any, idx: number) => (
              <div key={idx} className="p-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">{it.medicineName}</div>
                  <div className="text-[11px] text-slate-400">Qty: {it.quantity}</div>
                </div>
                <div className="font-bold text-slate-900">
                  ${(it.quantity * it.unitPrice).toFixed(2)}
                </div>
              </div>
            ))}
            <div className="p-3 bg-slate-50 flex justify-between items-center font-bold text-sm">
              <span>Total Estimated Payment:</span>
              <span className="text-emerald-700 font-extrabold">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
