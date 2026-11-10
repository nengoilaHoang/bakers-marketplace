import storefrontReleaseService, {
	StorefrontReleaseService,
} from '#/services/storefront-releases.service.js';
import storefrontService, {
	StorefrontService,
} from '#/services/storefronts.service.js';
import { AuthenticatedRequest } from '#/types/request.types.js';
import asyncHandler from '#/utils/asyncHandler.js';
import { Response } from 'express';

export class StorefrontController {
  constructor(
    private readonly storefrontService: StorefrontService,
    private readonly storefrontReleaseService: StorefrontReleaseService,
  ) {}

  public getMyStorefront = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user.id;
      const simpleStorefront =
        await this.storefrontService.getVendorStorefront(userId);
      return res.status(200).json({
        data: simpleStorefront,
      });
    },
  );

  public getActiveRelease = asyncHandler(
    async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
      const { id: storefrontId } = req.params;
      const vendorId = req.user.id;

      const data = await this.storefrontService.getActiveRelease(
        storefrontId,
        vendorId,
      );

      return res.status(200).json({
        data,
      });
    },
  );

  public getRelease = asyncHandler(
    async (req: AuthenticatedRequest<{ releaseId: string }>, res: Response) => {
      const { releaseId } = req.params;
      const vendorId = req.user.id;

      const data = await this.storefrontReleaseService.getRelease(
        releaseId,
        vendorId,
      );

      return res.status(200).json({
        data,
      });
    },
  );
}

const storefrontController = new StorefrontController(
  storefrontService,
  storefrontReleaseService,
);
export default storefrontController;
