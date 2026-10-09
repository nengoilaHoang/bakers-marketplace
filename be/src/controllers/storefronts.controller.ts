import storefrontService, {
	StorefrontService,
} from '#/services/storefronts.service.js';
import { AuthenticatedRequest } from '#/types/request.types.js';
import asyncHandler from '#/utils/asyncHandler.js';
import { Request, Response } from 'express';

export class StorefrontController {
  constructor(private readonly storefrontService: StorefrontService) {}

  public getMyStorefronts = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user.id;
      const simpleStorefronts =
        await this.storefrontService.getVendorStorefronts(userId);
      return res.status(200).json({
        data: simpleStorefronts,
      });
    },
  );

  public getActiveRelease = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params as {
        id: string;
      };

      await this.storefrontService.ensureStoreExists(id);
      const data = await this.storefrontService.getActiveRelease(id);

      return res.status(200).json({
        data,
      });
    },
  );

  public getRelease = asyncHandler(async (req: Request, res: Response) => {
    const { storeId, releaseId } = req.params as {
      storeId: string;
      releaseId: string;
    };

    await this.storefrontService.ensureStoreExists(storeId);
    await this.storefrontService.ensureReleaseExists(releaseId);
    const data = await this.storefrontService.getRelease(storeId, releaseId);

    return res.status(200).json({
      data,
    });
  });
}

const storefrontController = new StorefrontController(storefrontService);
export default storefrontController;
