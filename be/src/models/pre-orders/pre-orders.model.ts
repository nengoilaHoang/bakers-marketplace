import { z } from 'zod';

import { PageQuerySchema } from '#/models/admin/admin.model.js';
import {
	OrderCreateSchema,
	type OrderItemStatus,
	type OrderItemView,
	type OrderStatus,
	type ShippingAddress,
} from '#/models/orders/orders.model.js';
import type { ReportPerson } from '#/models/reports/reports.model.js';

/**
 * How long the vendors have to answer a pre-order request. Items still pending after that expire.
 * One hour while testing; set to 24 * 60 for real use.
 */
export const PRE_ORDER_APPROVAL_WINDOW_MINUTES = 60;

// How far ahead the first cycle may start
export const PRE_ORDER_MAX_START_DAYS = 60;

/** Cycle dates are calendar days in this time zone; a cycle's order is created at 00:00 of its day. */
export const PRE_ORDER_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export const PreOrderStatusSchema = z.enum([
	'PENDING',
	// Approved, first cycle not started yet
	'APPROVED',
	'DECLINED',
	// No item was approved before the approval deadline
	'EXPIRED',
	// From the start date until every cycle has its order
	'ACTIVE',
	'CANCELLED',
	'COMPLETED',
]);

/** MONTHLY: one cycle a month. BIWEEKLY: two cycles a month (the start day and 14 days later). */
export const RecurrenceFrequencySchema = z.enum(['MONTHLY', 'BIWEEKLY']);

export const CycleStatusSchema = z.enum(['SCHEDULED', 'ORDER_CREATED', 'SKIPPED', 'CANCELLED']);

// Payment is not built yet: these are stored with their defaults only
export const BillingTypeSchema = z.enum(['PREPAID', 'PER_DELIVERY']);
export const PaymentMethodSchema = z.enum(['CASH', 'CREDIT_DEBIT_CARD', 'DOMESTIC_CARD', 'VIETQR']);

export const PreOrderCreateSchema = OrderCreateSchema.extend({
	frequency: RecurrenceFrequencySchema,
	durationMonths: z.number().int().min(1).max(12),
	// YYYY-MM-DD, from today (the first order is then created as soon as the request is approved)
	startDate: z.iso.date(),
});

export const PreOrderQuerySchema = PageQuerySchema.extend({
	status: PreOrderStatusSchema.optional(),
});

export const PreOrderCancelSchema = z.object({
	reason: z.string().trim().max(500).optional(),
});

/** Requests a vendor received; awaiting=true keeps those still waiting for this vendor's answer. */
export const VendorPreOrderQuerySchema = PageQuerySchema.extend({
	status: PreOrderStatusSchema.optional(),
	awaiting: z
		.enum(['true', 'false'])
		.transform((value) => value === 'true')
		.optional(),
});

export type PreOrderStatus = z.infer<typeof PreOrderStatusSchema>;
export type RecurrenceFrequency = z.infer<typeof RecurrenceFrequencySchema>;
export type CycleStatus = z.infer<typeof CycleStatusSchema>;
export type BillingType = z.infer<typeof BillingTypeSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PreOrderCreate = z.infer<typeof PreOrderCreateSchema>;
export type PreOrderQuery = z.infer<typeof PreOrderQuerySchema>;
export type VendorPreOrderQuery = z.infer<typeof VendorPreOrderQuerySchema>;

export type PreOrderCycleView = {
	id: string;
	cycleNumber: number;
	currentStatus: CycleStatus;
	scheduledAt: Date;
	createdAt: Date;
	generatedOrder: { id: string; orderNumber: string; currentStatus: OrderStatus } | null;
};

export type PreOrderStatusHistoryView = {
	id: string;
	status: PreOrderStatus;
	actor: ReportPerson | null;
	note: string | null;
	timestamp: Date;
};

/** Columns every request view shares. */
export type PreOrderSummary = {
	id: string;
	currentStatus: PreOrderStatus;
	frequency: RecurrenceFrequency;
	durationMonths: number;
	// YYYY-MM-DD
	startDate: string;
	endDate: string;
	approvalDeadline: Date | null;
	billingPreference: BillingType;
	defaultPaymentMethod: PaymentMethod;
	currency: string;
	// What one cycle costs: items still in the request (pending or approved)
	cycleSubtotal: number;
	cycleCount: number;
	// Next cycle still to come; null when none is left
	nextCycleAt: Date | null;
	requestedAt: Date;
	updatedAt: Date;
};

export type PreOrderListItem = PreOrderSummary & {
	items: Pick<OrderItemView, 'id' | 'productTitle' | 'imageUrl' | 'quantity'>[];
};

export type PreOrderDetail = PreOrderSummary & {
	shippingAddress: ShippingAddress;
	// Same shape as order items (never rated)
	items: OrderItemView[];
	cycles: PreOrderCycleView[];
	statusHistory: PreOrderStatusHistoryView[];
};

export type VendorPreOrderListItem = PreOrderSummary & {
	customer: ReportPerson | null;
	myStatus: OrderItemStatus;
	myItemCount: number;
	// This vendor's items still in the request, for one cycle
	mySubtotal: number;
};

export type VendorPreOrderDetail = VendorPreOrderListItem & {
	shippingAddress: ShippingAddress;
	items: OrderItemView[];
	otherVendorItemCount: number;
	cycles: PreOrderCycleView[];
	statusHistory: PreOrderStatusHistoryView[];
};

/** The request a generated order came from. */
export type OrderPreOrderRef = {
	requestId: string;
	cycleNumber: number;
	cycleCount: number;
};
