import type { StockAlertRow } from '#/models/products/products.model.js';

type AlertType = StockAlertRow['alertType'];
type Threshold = Pick<StockAlertRow, 'alertType' | 'threshold'>;

/** Lowest to highest: MINIMUM < REORDER < MAXIMUM. */
const THRESHOLD_ORDER: AlertType[] = ['MINIMUM', 'REORDER', 'MAXIMUM'];

/** Returns an error message when the thresholds are not strictly increasing. */
export function getThresholdOrderError(alerts: Threshold[]): string | null {
	const ordered = THRESHOLD_ORDER.flatMap((alertType) =>
		alerts.filter((alert) => alert.alertType === alertType),
	);

	for (let index = 1; index < ordered.length; index += 1) {
		const lower = ordered[index - 1];
		const higher = ordered[index];

		if (lower.threshold >= higher.threshold) {
			return `${lower.alertType} (${lower.threshold}) must be lower than ${higher.alertType} (${higher.threshold})`;
		}
	}

	return null;
}
