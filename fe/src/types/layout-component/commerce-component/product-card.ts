import {
	BoxStyleConfig,
	ColorType,
	ImageScaleType,
	TextAlignmentType,
	TextConfig,
} from '..';
import { AspectRatioValue } from '../aspect-ratio';
import {
	BaseCommerceComponent,
	CreateBaseCommerceComponent,
	UpdateBaseCommerceComponent,
} from './commerce-component';

export type ProductCardThumbnailRatio = AspectRatioValue;

export type ProductCardBodyItem =
  | {
      type: 'description';
      value: string;
      style: TextConfig;
    }
  | ({
      type: 'ratings';
      value: string;
    } & (
      | {
          style: TextConfig;
          ratingType: 'numeral';
        }
      | { ratingType: 'stars'; color: ColorType }
    ))
  | {
      type: 'priceTag';
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
              textColor: string;
              fontWeight: number | 'bold' | 'extra-bold' | 'semi-bold';
              fontStyle: 'italic' | 'normal' | 'oblique';
            };
            unitColor: {
              textAlign: TextAlignmentType;
              decoration: 'strikethrough' | 'underline';
              textColor: string;
              fontWeight: number | 'bold' | 'extra-bold' | 'semi-bold';
              fontStyle: 'italic' | 'normal' | 'oblique';
            };
          }
        | undefined;
    };

export type ProductCardContent = {
  layout: 'simple';
  header: {
    title: { value: string } & TextConfig;
    subtitle?: ({ value: string } & TextConfig) | undefined;
  };
  body: Array<ProductCardBodyItem>;
};

export type ProductCardConfig = {
  thumbnail: {
    url: string;
    ratio: ProductCardThumbnailRatio;
    fit: ImageScaleType;
  };
  content: ProductCardContent;
} & BoxStyleConfig;

export interface ProductCardCommerceComponent extends BaseCommerceComponent<ProductCardConfig> {
  componentType: 'PRODUCT_CARD';
}

export interface UpdateProductCardCommerceComponent extends UpdateBaseCommerceComponent<ProductCardConfig> {
  componentType: 'PRODUCT_CARD';
}

export interface CreateProductCardCommerceComponent extends CreateBaseCommerceComponent<ProductCardConfig> {
  componentType: 'PRODUCT_CARD';
}
