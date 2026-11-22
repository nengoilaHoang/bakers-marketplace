import type { PageQuery, Paginated, PersonRef } from '@/types/admin';

export type { Paginated };

export type OrderStatus =
	| 'PENDING'
	| 'APPROVED'
	| 'DECLINED'
	| 'CANCELLED'
	| 'COMPLETED'
	| 'REFUNDED';

// Mỗi tiệm duyệt / từ chối các món của mình; món bị từ chối vẫn nằm trong đơn nhưng không tính tiền.
export type OrderItemStatus = 'PENDING' | 'APPROVED' | 'DECLINED';

export type ShipmentStatus =
	| 'LABEL_CREATED'
	| 'PICKED_UP'
	| 'IN_TRANSIT'
	| 'OUT_FOR_DELIVERY'
	| 'DELIVERED';

// Địa chỉ giao hàng: chép vào đơn lúc đặt, sửa về sau không làm đổi đơn cũ.
export type ShippingAddress = {
	recipientName: string;
	phone: string;
	streetAddress: string;
	ward: string;
	province: string;
	note?: string;
};

export type OrderItemRating = {
	id: string;
	rating: number;
	comment: string | null;
	ratedAt: string;
};

export type OrderItem = {
	id: string;
	// null khi sản phẩm đã bị xoá; tên món vẫn giữ trong productTitle.
	productId: string | null;
	productSlug: string | null;
	productTitle: string;
	imageUrl: string | null;
	unitPrice: number;
	unit: string;
	quantity: number;
	note: string | null;
	status: OrderItemStatus;
	declineReason: string | null;
	rating: OrderItemRating | null;
};

export type OrderStatusHistory = {
	id: string;
	status: OrderStatus;
	actor: PersonRef | null;
	note: string | null;
	timestamp: string;
};

export type TrackingEvent = {
	id: string;
	status: ShipmentStatus;
	locationName: string | null;
	description: string | null;
	timestamp: string;
};

export type Shipment = {
	id: string;
	carrier: string;
	trackingNumber: string | null;
	estimatedDelivery: string | null;
	currentStatus: ShipmentStatus;
	// Mới nhất trước.
	events: TrackingEvent[];
};

type OrderBase = {
	id: string;
	orderNumber: string;
	currentStatus: OrderStatus;
	subtotal: number;
	deliveryFee: number;
	taxPercentage: number;
	totalAmount: number;
	currency: string;
	placedAt: string;
	updatedAt: string;
};

export type OrderListItem = OrderBase & {
	items: Pick<OrderItem, 'id' | 'productTitle' | 'imageUrl' | 'quantity'>[];
};

export type OrderDetail = OrderBase & {
	shippingAddress: ShippingAddress;
	items: OrderItem[];
	// Cũ nhất trước.
	statusHistory: OrderStatusHistory[];
	shipment: Shipment | null;
};

export type OrderQuery = PageQuery & {
	status?: OrderStatus;
};

export type OrderCreateInput = {
	shippingAddress: ShippingAddress;
	items: { productId: string; quantity: number; note?: string }[];
};

// Một món của đơn cũ theo giá và tồn kho hiện tại, số lượng đã hạ xuống mức còn hàng.
export type ReorderItem = {
	productId: string;
	slug: string;
	title: string;
	unitPrice: number;
	currency: string;
	unit: string;
	imageUrl: string | null;
	brandId: string | null;
	brandName: string | null;
	stock: number;
	quantity: number;
};

export type ReorderResult = {
	items: ReorderItem[];
	skipped: { productTitle: string; reason: 'DELETED' | 'OUT_OF_STOCK' }[];
};

// ---------- phía vendor ----------

export type VendorOrderListItem = OrderBase & {
	customer: PersonRef | null;
	// Phần của tiệm mình: còn chờ duyệt, đã duyệt, hay bị từ chối hết.
	myStatus: OrderItemStatus;
	myItemCount: number;
	mySubtotal: number;
};

export type VendorOrderDetail = VendorOrderListItem & {
	shippingAddress: ShippingAddress;
	// Chỉ các món của tiệm mình.
	items: OrderItem[];
	otherVendorItemCount: number;
	statusHistory: OrderStatusHistory[];
	shipment: Shipment | null;
};

export type VendorOrderQuery = PageQuery & {
	status?: OrderStatus;
	awaiting?: boolean;
};

// ---------- phía admin: bảng giao hàng ----------

export type AdminShipment = {
	id: string;
	orderId: string;
	orderNumber: string;
	customer: PersonRef | null;
	itemCount: number;
	totalAmount: number;
	currency: string;
	carrier: string;
	trackingNumber: string | null;
	currentStatus: ShipmentStatus;
	updatedAt: string;
};

export type AdminShipmentView = 'active' | 'delivered' | 'all';
