import request from '@/lib/api';
import type {
	Paginated,
	PreOrderCreateInput,
	PreOrderDetail,
	PreOrderListItem,
	PreOrderQuery,
	VendorPreOrderDetail,
	VendorPreOrderListItem,
	VendorPreOrderQuery,
} from '@/types/preOrder';

export type * from '@/types/preOrder';

type Options = { signal?: AbortSignal };

function post<T>(path: string, body?: object): Promise<T> {
	return request<T>(path, {
		method: 'POST',
		body: body ? JSON.stringify(body) : undefined,
	});
}

/** Đặt định kỳ (chỉ tài khoản Baker): các tiệm duyệt một lần, mỗi kỳ hệ thống tự tạo đơn. */
export function createPreOrder(input: PreOrderCreateInput): Promise<{ data: PreOrderDetail }> {
	return post('/pre-orders', input);
}

export function getMyPreOrders(
	query: PreOrderQuery,
	{ signal }: Options = {},
): Promise<Paginated<PreOrderListItem>> {
	return request<Paginated<PreOrderListItem>>('/pre-orders/mine', { signal }, query);
}

export function getPreOrder(id: string, { signal }: Options = {}): Promise<{ data: PreOrderDetail }> {
	return request<{ data: PreOrderDetail }>(`/pre-orders/${id}`, { signal });
}

export function cancelPreOrder(id: string, reason?: string): Promise<{ data: PreOrderDetail }> {
	return post(`/pre-orders/${id}/cancel`, { reason });
}

export function skipPreOrderCycle(id: string, cycleId: string): Promise<{ data: PreOrderDetail }> {
	return post(`/pre-orders/${id}/cycles/${cycleId}/skip`);
}

// ---------- phía vendor ----------

export function getVendorPreOrders(
	query: VendorPreOrderQuery,
	{ signal }: Options = {},
): Promise<Paginated<VendorPreOrderListItem>> {
	return request<Paginated<VendorPreOrderListItem>>('/vendor/pre-orders', { signal }, query);
}

export function getVendorPreOrder(
	id: string,
	{ signal }: Options = {},
): Promise<{ data: VendorPreOrderDetail }> {
	return request<{ data: VendorPreOrderDetail }>(`/vendor/pre-orders/${id}`, { signal });
}

export function approveVendorPreOrder(id: string): Promise<{ data: VendorPreOrderDetail }> {
	return post(`/vendor/pre-orders/${id}/approve`);
}

export function declineVendorPreOrder(id: string, reason: string): Promise<{ data: VendorPreOrderDetail }> {
	return post(`/vendor/pre-orders/${id}/decline`, { reason });
}
