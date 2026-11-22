import type { PageQuery, Paginated, PersonRef } from '@/types/admin';
import type { OrderItem, OrderItemStatus, OrderStatus, ShippingAddress } from '@/types/order';

export type { Paginated };

// PENDING → APPROVED (đã duyệt, chưa tới ngày bắt đầu) / DECLINED / EXPIRED → ACTIVE (đang giao) → COMPLETED / CANCELLED.
export type PreOrderStatus =
	'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED';

// MONTHLY: mỗi tháng 1 kỳ. BIWEEKLY: mỗi tháng 2 kỳ (ngày bắt đầu và 14 ngày sau).
export type RecurrenceFrequency = 'MONTHLY' | 'BIWEEKLY';

// SCHEDULED: chưa tới ngày. ORDER_CREATED: hệ thống đã tạo đơn. SKIPPED: khách bỏ qua. CANCELLED: huỷ theo yêu cầu.
export type CycleStatus = 'SCHEDULED' | 'ORDER_CREATED' | 'SKIPPED' | 'CANCELLED';

export type PreOrderCycle = {
	id: string;
	cycleNumber: number;
	currentStatus: CycleStatus;
	scheduledAt: string;
	createdAt: string;
	generatedOrder: { id: string; orderNumber: string; currentStatus: OrderStatus } | null;
};

export type PreOrderStatusHistory = {
	id: string;
	status: PreOrderStatus;
	actor: PersonRef | null;
	note: string | null;
	timestamp: string;
};

type PreOrderBase = {
	id: string;
	currentStatus: PreOrderStatus;
	frequency: RecurrenceFrequency;
	durationMonths: number;
	// YYYY-MM-DD
	startDate: string;
	endDate: string;
	approvalDeadline: string | null;
	billingPreference: 'PREPAID' | 'PER_DELIVERY';
	defaultPaymentMethod: 'CASH' | 'CREDIT_DEBIT_CARD' | 'DOMESTIC_CARD' | 'VIETQR';
	currency: string;
	// Tiền một kỳ (các món còn trong yêu cầu).
	cycleSubtotal: number;
	cycleCount: number;
	nextCycleAt: string | null;
	requestedAt: string;
	updatedAt: string;
};

export type PreOrderListItem = PreOrderBase & {
	items: Pick<OrderItem, 'id' | 'productTitle' | 'imageUrl' | 'quantity'>[];
};

export type PreOrderDetail = PreOrderBase & {
	shippingAddress: ShippingAddress;
	items: OrderItem[];
	cycles: PreOrderCycle[];
	// Cũ nhất trước.
	statusHistory: PreOrderStatusHistory[];
};

export type PreOrderQuery = PageQuery & {
	status?: PreOrderStatus;
};

export type PreOrderCreateInput = {
	shippingAddress: ShippingAddress;
	items: { productId: string; quantity: number; note?: string }[];
	frequency: RecurrenceFrequency;
	durationMonths: number;
	startDate: string;
};

// ---------- phía vendor ----------

export type VendorPreOrderListItem = PreOrderBase & {
	customer: PersonRef | null;
	myStatus: OrderItemStatus;
	myItemCount: number;
	// Tiền phần của tiệm trong một kỳ.
	mySubtotal: number;
};

export type VendorPreOrderDetail = VendorPreOrderListItem & {
	shippingAddress: ShippingAddress;
	items: OrderItem[];
	otherVendorItemCount: number;
	cycles: PreOrderCycle[];
	statusHistory: PreOrderStatusHistory[];
};

export type VendorPreOrderQuery = PageQuery & {
	status?: PreOrderStatus;
	awaiting?: boolean;
};
