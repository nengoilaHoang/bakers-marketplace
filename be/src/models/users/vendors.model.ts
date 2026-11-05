import { z } from 'zod';
import { DocumentSchema } from '../files/documents.model.js';
import { ImageSchema } from '../files/images.model.js';
import { UserSchema } from './users.model.js';

export const VendorBusinessTypeSchema = z.enum(['INDIVIDUAL', 'HOUSEHOLD', 'COMPANY']);
export const CompanyEntityTypeSchema = z.enum(['LIMITED_LIABILITY_COMPANY', 'JOINT_STOCK_COMPANY', 'PARTNERSHIP_COMPANY', 'PRIVATE_ENTERPRISE', 'STATE_OWNED_ENTERPRISE', 'OTHER']);

export const VendorContactInfoTableSchema = z.object({
	id: z.uuidv4().readonly(),
	representativeName: z.string().min(1).max(255),
	representativeRole: z.string().min(1).max(100),
	businessEmail: z.email().min(1).max(255),
	businessPhone: z.string().min(10).max(15),
	businessAddress: z.string().min(1).max(500),
});

export const VendorContactInfoSchema = VendorContactInfoTableSchema;

export const VendorTableSchema = UserSchema.extend({
	businessType: VendorBusinessTypeSchema,
	taxCode: z.string().min(10).max(13),
	registeredAt: z.date().readonly(),
});

export const IndividualVendorTableSchema = VendorTableSchema.extend({
	businessType: z.literal('INDIVIDUAL'),
	citizenId: z.string().length(12),
	identityCardFrontDocId: z.uuidv4().readonly(),
	identityCardBackDocId: z.uuidv4().readonly(),
});

export const CompanyVendorTableSchema = VendorTableSchema.extend({
	businessType: z.union([z.literal('HOUSEHOLD'), z.literal('COMPANY')]),
	legalBusinessName: z.string().min(1).max(255),
	entityType: CompanyEntityTypeSchema,
	yearOfEstablishment: z.number().int().min(1900).max(new Date().getFullYear()),
	businessWebsiteUrl: z.url().optional().nullable(),
	businessDescription: z.string().min(1).max(1000),
	businessLicenseDocId: z.uuidv4().readonly(),
});

export const BaseVendorSchema = VendorTableSchema.extend({
	contactInfo: VendorContactInfoSchema,
});

export const IndividualVendorSchema = BaseVendorSchema.extend({
	businessType: z.literal('INDIVIDUAL'),
	citizenId: z.string().length(12),
	identityCardFrontDoc: ImageSchema,
	identityCardBackDoc: ImageSchema,
});

export const CompanyVendorSchema = BaseVendorSchema.extend({
	businessType: z.union([z.literal('HOUSEHOLD'), z.literal('COMPANY')]),
	legalBusinessName: z.string().min(1).max(255),
	yearOfEstablishment: z.number().int().min(1900).max(new Date().getFullYear()),
	entityType: CompanyEntityTypeSchema,
	businessWebsiteUrl: z.url().optional().nullable(),
	businessDescription: z.string().min(1).max(1000),
	businessLicenseDoc: DocumentSchema,
});

export const VendorSchema = z.union([IndividualVendorSchema, CompanyVendorSchema]);

export type VendorRow = z.infer<typeof VendorTableSchema>;
export type Vendor = z.infer<typeof BaseVendorSchema>;
