import { TextAlignmentType, TextConfig } from '..';
import {
	BaseCommerceComponent,
	CreateBaseCommerceComponent,
	UpdateBaseCommerceComponent,
} from './commerce-component';

export type ProductCardThumbnailRatio = '16:9' | '4:3' | '1:1';
export type ProductCardThumbnailScale = 'none' | 'fill' | 'contain' | 'cover';

type ProductCardBodyItem =
  | {
      type: 'description';
      display: boolean;
      value: string;
      style: TextConfig;
    }
  | {
      type: 'ratings';
      display: boolean;
      value: string;
      style: TextConfig;
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
      style: TextConfig;
    };
    subtitle: {
      display: boolean;
      value: string;
      style: TextConfig;
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

export interface ProductCardCommerceComponent extends BaseCommerceComponent<ProductCardConfig> {
  componentType: 'PRODUCT_CARD';
}

export interface UpdateProductCardCommerceComponent extends UpdateBaseCommerceComponent<ProductCardConfig> {
  componentType: 'PRODUCT_CARD';
}

export interface CreateProductCardCommerceComponent extends CreateBaseCommerceComponent<ProductCardConfig> {
  componentType: 'PRODUCT_CARD';
}
