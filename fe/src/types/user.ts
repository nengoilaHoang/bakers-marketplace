import { Image } from './files';

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'BAKER' | 'VENDOR';
export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'BANNED';
export type VendorBusinessType = 'INDIVIDUAL' | 'HOUSEHOLD' | 'COMPANY';
export type CompanyEntityType = 'LIMITED_LIABILITY_COMPANY' | 'JOINT_STOCK_COMPANY' | 'PARTNERSHIP_COMPANY' | 'PRIVATE_ENTERPRISE' | 'STATE_OWNED_ENTERPRISE' | 'OTHER';

export type User = {
	id: string;
	email: string;
	displayName: string;
	role: UserRole;
	status?: UserStatus;
	createdAt: Date;
}

export type BaseVendor = User & {
	role: 'VENDOR';
	businessType: VendorBusinessType;
	taxCode: string;
	contactInfo: VendorContactInfo;
	registeredAt: Date | null;
};

export type VendorContactInfo = {
	id: string;
	representativeName: string;
	representativeRole: string;
	businessEmail: string;
	businessPhone: string;
	businessAddress: string;
}

export type IndividualVendor = BaseVendor & {
	businessType: 'INDIVIDUAL';
	citizenId: string;
	identityCardFrontDoc: Image;
	identityCardBackDoc: Image;
};

export type CompanyVendor = BaseVendor & {
	businessType: 'COMPANY' | 'HOUSEHOLD';
	legalBusinessName: string;
	entityType: CompanyEntityType;
	yearOfEstablishment: number;
	businessWebsiteUrl: string | null;
	businessDescription: string;
	businessLicenseDoc: Document;
}

export type Vendor = IndividualVendor | CompanyVendor;

// Hồ sơ công khai (GET /users/:id): không có email, chỉ số bài viết và công thức công khai.
export type PublicProfile = {
	id: string;
	displayName: string;
	role: UserRole;
	postCount: number;
	recipeCount: number;
	createdAt: string;
};
