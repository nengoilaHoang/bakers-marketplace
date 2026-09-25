import {
	BaseLayoutComponent,
	BaseLayoutComponentConfig,
	CreateBaseLayoutComponent,
	TextAlignmentType,
	TextStyle,
	UpdateBaseLayoutComponent,
} from '.';

export type CommerceComponentType =
	| 'HERO_BANNER'
	| 'IMAGE_BANNER'
	| 'PRODUCT_CARD'
	| 'PRODUCT_DETAILS'
	| 'REVIEW_GRID'
	| 'CONTACT_FORM'
	| 'FAQ';

export type BaseCommerceComponent<TConfig> = BaseLayoutComponent<TConfig> & {
	type: 'COMMERCE';
	componentType: CommerceComponentType;
};

export type UpdateBaseCommerceComponent<
	TConfig = BaseLayoutComponentConfig<unknown>,
> = UpdateBaseLayoutComponent<TConfig> & {
	type: 'COMMERCE';
	componentType: CommerceComponentType;
};

export type CreateBaseCommerceComponent<
	TConfig = BaseLayoutComponentConfig<unknown>,
> = CreateBaseLayoutComponent<TConfig> & {
	type: 'COMMERCE';
	componentType: CommerceComponentType;
};

/* --- Product Card Commerce Component --- */

export type ProductCardThumbnailRatio = '16:9' | '4:3' | '1:1';
export type ProductCardThumbnailScale = 'none' | 'fill' | 'contain' | 'cover';

type ProductCardBodyItem =
	| {
			type: 'description';
			display: boolean;
			value: string;
			style: TextStyle;
	  }
	| {
			type: 'ratings';
			display: boolean;
			value: string;
			style: TextStyle;
			ratingType?: 'numeral' | 'stars' | undefined;
	  }
	| {
			type: 'priceTag';
			display: boolean;
			value: string;
			currency: string;
			unit: string;
			format: {
				showUnit: boolean;
				showCurrency: boolean;
				unitSeparator: '.' | '/' | 'per';
			};
			style?:
				| {
						color: {
							textAlign: TextAlignmentType;
							decoration: 'strikethrough' | 'underline';
							txtColor: string;
							fontWeight: number | 'bold' | 'extra-bold' | 'semi-bold';
							fontStyle: 'italic' | 'normal' | 'oblique';
						};
						unitColor: {
							textAlign: TextAlignmentType;
							decoration: 'strikethrough' | 'underline';
							txtColor: string;
							fontWeight: number | 'bold' | 'extra-bold' | 'semi-bold';
							fontStyle: 'italic' | 'normal' | 'oblique';
						};
				  }
				| undefined;
	  };

export type ProductCardBody = {
	layout: 'simple';
	header: {
		title: {
			value: string;
			style: TextStyle;
		};
		subtitle: {
			display: boolean;
			value: string;
			style: TextStyle;
		};
	};
	body: Array<ProductCardBodyItem>;
};

export type ProductCardConfig = {
	thumbnail: {
		url: string;
		ratio: ProductCardThumbnailRatio;
		scale: ProductCardThumbnailScale;
	};
	content: ProductCardBody;
};

export type ProductCardCommerceComponent =
	BaseCommerceComponent<ProductCardConfig> & {
		componentType: 'PRODUCT_CARD';
	};

export type UpdateProductCardCommerceComponent =
	UpdateBaseCommerceComponent<ProductCardConfig> & {
		componentType: 'PRODUCT_CARD';
	};

export type CreateProductCardCommerceComponent =
	CreateBaseCommerceComponent<ProductCardConfig> & {
		componentType: 'PRODUCT_CARD';
	};

/* --- Hero Banner Commerce Component --- */

export type HeroBannerContentPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'middle-left'
	| 'middle-center'
	| 'middle-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export type HeroBannerOverlay =
	| {
			type: 'none';
	  }
	| {
			type: 'solid';
			color: string;
			opacity?: number | undefined;
	  }
	| {
			type: 'gradient';
			color: string;
			opacity?: number | undefined;
	  };

export type HeroBannerCta = {
	label: string;
	url: string;
	style: 'solid' | 'outline' | 'ghost';
	size: 'sm' | 'md' | 'lg';
	target: '_self' | '_blank';
};

export type BaseHeroBannerConfig = {
	desktopMediaUrl: string;
	mobileMediaUrl: string | null;
	altText: string;
	eyebrow?: ({ value: string } & TextStyle) | undefined;
	title: { value: string } & TextStyle;
	subtitle: { value: string } & TextStyle;
	contentPosition: HeroBannerContentPosition;
	overlay: HeroBannerOverlay;
	primaryCta?: HeroBannerCta | undefined;
	secondaryCta?: HeroBannerCta | undefined;
	ctaPosition?: HeroBannerContentPosition | undefined;
};

export type ImageHeroBannerConfig = BaseHeroBannerConfig & {
	mediaType: 'image';
};

export type VideoHeroBannerConfig = BaseHeroBannerConfig & {
	mediaType: 'video';
	posterUrl: string;
	videoAutoplay?: boolean;
};

export type HeroBannerConfig = ImageHeroBannerConfig | VideoHeroBannerConfig;

export type HeroBannerCommerceComponent =
	BaseCommerceComponent<HeroBannerConfig> & {
		componentType: 'HERO_BANNER';
	};

export type UpdateHeroBannerCommerceComponent =
	UpdateBaseCommerceComponent<HeroBannerConfig> & {
		componentType: 'HERO_BANNER';
	};

export type CreateHeroBannerCommerceComponent =
	CreateBaseCommerceComponent<HeroBannerConfig> & {
		componentType: 'HERO_BANNER';
	};

export type CommerceComponent =
	| ProductCardCommerceComponent
	| HeroBannerCommerceComponent;

export type UpdateCommerceComponent =
	| UpdateProductCardCommerceComponent
	| UpdateHeroBannerCommerceComponent;

export type CreateCommerceComponent =
	| CreateProductCardCommerceComponent
	| CreateHeroBannerCommerceComponent;
