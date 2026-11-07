// types/layout-component/commerce-component/commerce-component.ts
import {
	BaseLayoutComponent,
	BaseLayoutComponentConfig,
	CreateBaseLayoutComponent,
	UpdateBaseLayoutComponent,
} from '..';
import {
	CreateHeroBannerCommerceComponent,
	HeroBannerCommerceComponent,
	UpdateHeroBannerCommerceComponent,
} from './hero-banner';
import {
	CreateProductCardCommerceComponent,
	ProductCardCommerceComponent,
	UpdateProductCardCommerceComponent,
} from './product-card';

export type CommerceComponentType =
  | 'HERO_BANNER'
  | 'IMAGE_BANNER'
  | 'PRODUCT_CARD'
  | 'PRODUCT_DETAILS'
  | 'REVIEW_GRID'
  | 'CONTACT_FORM'
  | 'FAQ';

export interface BaseCommerceComponent<
  TConfig = unknown,
> extends BaseLayoutComponent<BaseLayoutComponentConfig<TConfig>> {
  type: 'COMMERCE';
  componentType: CommerceComponentType;
}

export interface UpdateBaseCommerceComponent<
  TConfig = unknown,
> extends UpdateBaseLayoutComponent<BaseLayoutComponentConfig<TConfig>> {
  type: 'COMMERCE';
  componentType: CommerceComponentType;
}

export interface CreateBaseCommerceComponent<
  TConfig = unknown,
> extends CreateBaseLayoutComponent<BaseLayoutComponentConfig<TConfig>> {
  type: 'COMMERCE';
  componentType: CommerceComponentType;
}

export type CommerceComponent =
  | ProductCardCommerceComponent
  | HeroBannerCommerceComponent;

export type UpdateCommerceComponent =
  | UpdateProductCardCommerceComponent
  | UpdateHeroBannerCommerceComponent;

export type CreateCommerceComponent =
  | CreateProductCardCommerceComponent
  | CreateHeroBannerCommerceComponent;