import { z } from 'zod';

import { PageQuerySchema } from '#/models/admin/admin.model.js';
import type { ReportPerson } from '#/models/reports/reports.model.js';

export const OrderStatusSchema = z.enum([
	'PENDING',
	'APPROVED',
	'DECLINED',
	'CANCELLED',
	'COMPLETED',
	'REFUNDED',
]);

/** Each vendor approves or declines its own items of an order. */
export const OrderItemStatusSchema = z.enum(['PENDING', 'APPROVED', 'DECLINED']);

export const ShipmentStatusSchema = z.enum([
	'LABEL_CREATED',
	'PICKED_UP',
	'IN_TRANSIT',
	'OUT_FOR_DELIVERY',
	'DELIVERED',
]);

/** The delivery address, copied into the order when it is placed. */
export const ShippingAddressSchema = z.object({
	recipientName: z.string().trim().min(1).max(255),
	phone: z
		.string()
		.trim()
		.regex(/^(0|\+84)\d{9,10}$/, 'Invalid Vietnamese phone number'),
	streetAddress: z.string().trim().min(1).max(500),
	ward: z.string().trim().min(1).max(255),
	province: z.string().trim().min(1).max(255),
	note: z.string().trim().max(500).optional(),
});

export const OrderItemCreateSchema = z.object({
	productId: z.uuidv4(),
	quantity: z.number().int().min(1).max(999),
	note: z.string().trim().max(500).optional(),
});

/** A whole cart: products of any vendors, each product at most once. */
export const OrderCreateSchema = z.object({
	shippingAddress: ShippingAddressSchema,
	items: z
		.array(OrderItemCreateSchema)
		.min(1)
		.max(50)
		.refine(
			(items) => new Set(items.map((item) => item.productId)).size === items.length,
			'Each product can appear only once',
		),
});

export const OrderQuerySchema = PageQuerySchema.extend({
	status: OrderStatusSchema.optional(),
});

export const OrderCancelSchema = z.object({
	reason: z.string().trim().max(500).optional(),
});

/** Orders a vendor received; awaiting=true keeps those still waiting for this vendor's answer. */
export const VendorOrderQuerySchema = PageQuerySchema.extend({
	status: OrderStatusSchema.optional(),
	awaiting: z
		.enum(['true', 'false'])
		.transform((value) => value === 'true')
		.optional(),
});

/** Admin shipping board: in progress (default), delivered, or every shipment. */
export const AdminShipmentQuerySchema = PageQuerySchema.extend({
	view: z.enum(['active', 'delivered', 'all']).default('active'),
});

export const VendorOrderDeclineSchema = z.object({
	reason: z.string().trim().min(1).max(500),
});

export const OrderRatingCreateSchema = z.object({
	rating: z.number().int().min(1).max(5),
	comment: z.string().trim().max(1000).optional(),
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderItemStatus = z.infer<typeof OrderItemStatusSchema>;
export type VendorOrderQuery = z.infer<typeof VendorOrderQuerySchema>;
export type AdminShipmentQuery = z.infer<typeof AdminShipmentQuerySchema>;
export type ShipmentStatus = z.infer<typeof ShipmentStatusSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type OrderCreate = z.infer<typeof OrderCreateSchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;
export type OrderRatingCreate = z.infer<typeof OrderRatingCreateSchema>;

export type OrderItemRating = {
	id: string;
	rating: number;
	comment: string | null;
	ratedAt: Date;
};

export type OrderItemView = {
	id: string;
	// Null once the product has been deleted; the title below is the copy kept by the order
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

export type OrderStatusHistoryView = {
	id: string;
	status: OrderStatus;
	actor: ReportPerson | null;
	note: string | null;
	timestamp: Date;
};

export type TrackingEventView = {
	id: string;
	status: ShipmentStatus;
	locationName: string | null;
	description: string | null;
	timestamp: Date;
};

export type ShipmentView = {
	id: string;
	carrier: string;
	trackingNumber: string | null;
	estimatedDelivery: Date | null;
	currentStatus: ShipmentStatus;
	events: TrackingEventView[];
};

/** Columns every order view shares. */
export type OrderSummary = {
	id: string;
	orderNumber: string;
	currentStatus: OrderStatus;
	subtotal: number;
	deliveryFee: number;
	taxPercentage: number;
	totalAmount: number;
	currency: string;
	placedAt: Date;
	updatedAt: Date;
};

export type OrderListItem = OrderSummary & {
	items: Pick<OrderItemView, 'id' | 'productTitle' | 'imageUrl' | 'quantity'>[];
};

export type OrderDetail = OrderSummary & {
	shippingAddress: ShippingAddress;
	items: OrderItemView[];
	statusHistory: OrderStatusHistoryView[];
	shipment: ShipmentView | null;
};

/** One line of a reorder: the product as it is sold now. */
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
	// The old quantity, lowered to the stock left
	quantity: number;
};

export type ReorderResult = {
	items: ReorderItem[];
	skipped: { productTitle: string; reason: 'DELETED' | 'OUT_OF_STOCK' }[];
};

/** How the vendor's own items in an order stand: still to answer, approved, or all declined. */
export type VendorPartStatus = OrderItemStatus;

export type VendorOrderListItem = OrderSummary & {
	customer: ReportPerson | null;
	myStatus: VendorPartStatus;
	myItemCount: number;
	// The vendor's items still in the order (declined ones excluded)
	mySubtotal: number;
};

export type VendorOrderDetail = OrderSummary & {
	customer: ReportPerson | null;
	shippingAddress: ShippingAddress;
	myStatus: VendorPartStatus;
	// Only this vendor's items; other vendors' items stay hidden
	items: OrderItemView[];
	otherVendorItemCount: number;
	statusHistory: OrderStatusHistoryView[];
	shipment: ShipmentView | null;
};

/** One delivery on the admin shipping board. */
export type AdminShipmentRow = {
	id: string;
	orderId: string;
	orderNumber: string;
	customer: ReportPerson | null;
	// Items still in the order (approved ones)
	itemCount: number;
	totalAmount: number;
	currency: string;
	carrier: string;
	trackingNumber: string | null;
	currentStatus: ShipmentStatus;
	updatedAt: Date;
};
