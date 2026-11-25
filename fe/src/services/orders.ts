import request from '@/lib/api';
import type {
	OrderCreateInput,
	OrderDetail,
	OrderListItem,
	OrderQuery,
	Paginated,
	ReorderResult,
	VendorOrderDetail,
	VendorOrderListItem,
	VendorOrderQuery,
} from '@/types/order';

export type * from '@/types/order';

type Options = { signal?: AbortSignal };

function post<T>(path: string, body?: object): Promise<T> {
	return request<T>(path, {
		method: 'POST',
		body: body ? JSON.stringify(body) : undefined,
	});
}

/** Đặt một đơn cho cả giỏ hàng (sản phẩm của nhiều vendor). BE tự lấy giá và trừ tồn kho. */
export function placeOrder(input: OrderCreateInput): Promise<{ data: OrderDetail }> {
	return post('/orders', input);
}

export function getMyOrders(
	query: OrderQuery,
	{ signal }: Options = {},
): Promise<Paginated<OrderListItem>> {
	return request<Paginated<OrderListItem>>('/orders/mine', { signal }, query);
}

export function getOrder(id: string, { signal }: Options = {}): Promise<{ data: OrderDetail }> {
	return request<{ data: OrderDetail }>(`/orders/${id}`, { signal });
}

export function cancelOrder(id: string, reason?: string): Promise<{ data: OrderDetail }> {
	return post(`/orders/${id}/cancel`, { reason });
}

export function getReorderItems(id: string): Promise<{ data: ReorderResult }> {
	return request<{ data: ReorderResult }>(`/orders/${id}/reorder`);
}

export function rateOrderItem(
	orderId: string,
	itemId: string,
	input: { rating: number; comment?: string },
): Promise<{ data: OrderDetail }> {
	return post(`/orders/${orderId}/items/${itemId}/rating`, input);
}

// ---------- phía vendor: đơn có sản phẩm của tiệm, tiệm duyệt / từ chối phần của mình ----------

export function getVendorOrders(
	query: VendorOrderQuery,
	{ signal }: Options = {},
): Promise<Paginated<VendorOrderListItem>> {
	return request<Paginated<VendorOrderListItem>>('/vendor/orders', { signal }, query);
}

export function getVendorOrder(
	id: string,
	{ signal }: Options = {},
): Promise<{ data: VendorOrderDetail }> {
	return request<{ data: VendorOrderDetail }>(`/vendor/orders/${id}`, { signal });
}

export function approveVendorOrder(id: string): Promise<{ data: VendorOrderDetail }> {
	return post(`/vendor/orders/${id}/approve`);
}

export function declineVendorOrder(id: string, reason: string): Promise<{ data: VendorOrderDetail }> {
	return post(`/vendor/orders/${id}/decline`, { reason });
}
